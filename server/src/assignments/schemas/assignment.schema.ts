import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;
export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  minWords: number;

  @Prop({ required: true, enum: ['strict', 'loose'], default: 'strict' })
  mode: 'strict' | 'loose';

  @Prop()
  description?: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

@Schema({ timestamps: true })
export class Submission {
  @Prop({ type: Types.ObjectId, ref: 'Assignment' })
  assignment: Types.ObjectId;

  @Prop()
  studentName: string;

  @Prop()
  rollNumber: string;

  @Prop()
  rawText: string;

  @Prop()
  score: number;

  @Prop()
  remarks: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
