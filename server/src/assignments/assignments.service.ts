import { Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AssignmentDocument, SubmissionDocument } from './schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { extractTextFromPdf, parseMetaFromFilename } from '../utils/pdf.utils';
import { GeminiService } from '../common/gemini.service';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectModel('Assignment') private assignmentModel: Model<AssignmentDocument>,
    @InjectModel('Submission') private submissionModel: Model<SubmissionDocument>,
    private geminiService: GeminiService,
  ) {}

  async createAssignment(dto: CreateAssignmentDto) {
    const created = new this.assignmentModel(dto);
    return created.save();
  }

  async getAssignment(id: string) {
    return this.assignmentModel.findById(id).lean();
  }

  async getAllAssignments() {
    return this.assignmentModel.find().lean();
  }

  async processPdfs(assignmentId: string, files: Express.Multer.File[]) {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const results: any[] = [];

    for (const file of files) {
      try {
        // Copy uploaded file into /tmp to ensure writable path
        const tempDir = "/tmp/uploads";
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempPath = path.join(tempDir, file.originalname);
        fs.writeFileSync(tempPath, file.buffer || fs.readFileSync(file.path));

        // Parse PDF text
        const rawText = await extractTextFromPdf(tempPath);

        // Extract name/roll from filename
        const meta = parseMetaFromFilename(file.originalname);
        let studentName = meta.name || null;
        let rollNumber = meta.roll || null;

        // Try to infer from document text if missing
        if ((!studentName || !rollNumber) && rawText) {
          const lines = rawText.split(/\r?\n/).slice(0, 10).map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (!studentName && /name[:\-]/i.test(line)) {
              studentName = line.replace(/name[:\-]/i, '').trim();
            }
            if (!rollNumber && /roll[:\-]|registration[:\-]|id[:\-]/i.test(line)) {
              rollNumber = line.replace(/(roll|registration|id)[:\-]/i, '').trim();
            }
          }
        }

        // Build prompt for Gemini
        const prompt = this.buildPrompt(assignment.title, assignment.minWords, assignment.mode, rawText);

        let aiText: string | null = null;
        try {
          aiText = await this.geminiService.evaluateWithGemini(prompt);
          this.logger.debug("✅ Gemini raw response: " + aiText);
        } catch (err) {
          this.logger.warn('⚠️ Gemini service error: ' + err?.message);
          aiText = null;
        }

        // Score submission
        const evaluation = aiText
          ? this.parseAiEvaluation(aiText)
          : this.heuristicEvaluate(rawText, assignment.title, assignment.minWords, assignment.mode);

        // Save submission in DB
        const submission = new this.submissionModel({
          assignment: assignment._id,
          studentName: studentName || 'Unknown',
          rollNumber: rollNumber || 'Unknown',
          rawText,
          score: evaluation.score,
          remarks: evaluation.remarks,
        });

        await submission.save();

        results.push({
          originalName: file.originalname,
          studentName: submission.studentName,
          rollNumber: submission.rollNumber,
          score: evaluation.score,
          remarks: evaluation.remarks,
        });

        // Clean up temp file
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          this.logger.warn(`⚠️ Could not delete temp file: ${e.message}`);
        }

      } catch (err) {
        this.logger.error(`❌ Error processing file ${file.originalname}: ${err.message}`);
        results.push({
          originalName: file.originalname,
          error: err.message,
        });
      }
    }

    return results;
  }

  private buildPrompt(title: string, minWords: number, mode: string, submissionText: string) {
    return `
You are an assignment grader.

Assignment: "${title}", minimum words: ${minWords}, mode: ${mode}.

Student submission:
${submissionText}

⚠️ Important: Return ONLY valid JSON, no explanations, no markdown fences, no extra text. give score from 0 to 100.
Format exactly like this:
{"score": number, "remarks": "string"}
`;
  }

  private parseAiEvaluation(aiText: string) {
    this.logger.debug("🔎 Raw AI output before parsing:\n" + aiText);

    try {
      // 1. Clean AI response
      let cleanText = aiText.trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/[\u0000-\u001F]+/g, '') // remove control chars
        .trim();

      this.logger.debug("🧹 Cleaned AI response:\n" + cleanText);

      // 2. Try strict JSON parse first
      try {
        const obj = JSON.parse(cleanText);
        return {
          score: Number(obj.score) || 0,
          remarks: obj.remarks || '',
        };
      } catch (jsonErr) {
        this.logger.warn("⚠️ Strict JSON parse failed, trying regex fallback: " + jsonErr.message);
      }

      // 3. Regex fallback → extract JSON-like substring
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const obj = JSON.parse(jsonMatch[0]);
          return {
            score: Number(obj.score) || 0,
            remarks: obj.remarks || '',
          };
        } catch (fallbackErr) {
          this.logger.error("❌ Fallback JSON parse error: " + fallbackErr.message);
        }
      }

      // 4. If nothing works → heuristic backup
      this.logger.error("❌ Could not parse AI evaluation at all. Raw text was: " + aiText);
      return { score: 0, remarks: "Could not parse AI evaluation" };

    } catch (err) {
      this.logger.error("❌ Unexpected AI parsing error: " + err.message);
      return { score: 0, remarks: "Parse error in AI evaluation" };
    }
  }

  private heuristicEvaluate(text: string, title: string, minWords: number, mode: 'strict' | 'loose') {
    const lowerTitle = title.toLowerCase();
    const textNormalized = (text || '').replace(/\s+/g, ' ').trim();
    const words = textNormalized ? textNormalized.split(' ').length : 0;

    const titleKeywords = lowerTitle.replace(/[,\.]/g, '').split(' ').filter(Boolean);
    const textLower = (text || '').toLowerCase();
    let keywordHits = 0;
    for (const k of titleKeywords) {
      if (k.length <= 3) continue;
      if (textLower.includes(k)) keywordHits++;
    }
    const topicScore = Math.min(1, keywordHits / Math.max(1, titleKeywords.length));

    let lengthScore = words >= minWords ? 1 : words / Math.max(1, minWords);

    let structureScore = 0;
    if (/introduction|intro|conclusion|concluding|in conclusion/i.test(text)) structureScore = 1;
    else {
      const sentences = text.split(/[.?!]\s/).map(s => s.trim()).filter(Boolean);
      if (sentences.length >= 3) structureScore = 0.7;
    }

    let base = (0.5 * topicScore + 0.3 * lengthScore + 0.2 * structureScore) * 100;

    if (mode === 'strict') {
      if (topicScore < 0.3) base *= 0.5;
      if (words < minWords * 0.75) base *= 0.7;
    } else {
      if (words >= minWords * 0.5) base += 5;
      base = Math.min(100, base);
    }

    const score = Math.round(Math.max(0, Math.min(100, base)));

    const remarksParts: string[] = [];
    if (topicScore > 0.6) remarksParts.push('On-topic');
    else if (topicScore > 0.3) remarksParts.push('Some relevance');
    else remarksParts.push('Off-topic');

    if (words >= minWords) remarksParts.push(`Met length (${words} words)`);
    else remarksParts.push(`Too short (${words} words, expected ${minWords})`);

    if (structureScore >= 0.9) remarksParts.push('Good structure');
    else if (structureScore >= 0.6) remarksParts.push('Basic structure');
    else remarksParts.push('Missing clear intro/conclusion');

    return { score, remarks: remarksParts.join('; ') };
  }

  async exportCsvForAssignment(assignmentId: string): Promise<{ path: string; filename: string }> {
    const submissions = await this.submissionModel.find({
      assignment: new Types.ObjectId(assignmentId),
    }).lean();

    const assignment = await this.assignmentModel.findById(assignmentId);

    const filename = `marks_${assignmentId}_${Date.now()}.csv`;
    const outPath = path.join(os.tmpdir(), filename); // ✅ use tmpdir for Vercel

    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const csvWriter = createObjectCsvWriter({
      path: outPath,
      header: [
        { id: 'studentName', title: 'Student Name' },
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'score', title: 'Score' },
        { id: 'remarks', title: 'Remarks' },
      ],
    });

    const records = submissions.map((s) => ({
      studentName: s.studentName || 'Unknown',
      rollNumber: s.rollNumber || 'Unknown',
      score: s.score ?? 0,
      remarks: s.remarks ?? '',
    }));

    await csvWriter.writeRecords(records);

    return { path: outPath, filename };
  }

  async updateAssignment(id: string, dto: Partial<CreateAssignmentDto>) {
    const updated = await this.assignmentModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, lean: true }
    );
    if (!updated) throw new Error("Assignment not found");
    return updated;
  }

  async deleteAssignment(id: string) {
    const deleted = await this.assignmentModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error("Assignment not found");

    await this.submissionModel.deleteMany({ assignment: new Types.ObjectId(id) });

    return { message: "Assignment deleted successfully", id };
  }
}
