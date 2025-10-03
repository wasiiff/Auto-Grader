import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { Response } from 'express';
import * as multer from 'multer';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  async findAll() {
    return this.assignmentsService.getAllAssignments();
  }

  @Post()
  async createAssignment(@Body() body: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(body);
  }

  @Post(':id/upload')
  @UseInterceptors(
    FilesInterceptor('files', 50, {
      storage: multer.memoryStorage(), // ✅ use memory storage for Vercel
      fileFilter: (req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith('.pdf')) {
          return cb(new Error('Only PDFs allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }
    const res = await this.assignmentsService.processPdfs(id, files);
    return { processed: res };
  }

  @Get(':id/download')
  async downloadCsv(@Param('id') id: string, @Res() res: Response) {
    try {
      const { path: outPath, filename } =
        await this.assignmentsService.exportCsvForAssignment(id);

      res.download(outPath, filename, err => {
        if (err) {
          console.error('Error sending file', err);
          res.status(500).send('Error downloading file');
        }
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateAssignment(
    @Param('id') id: string,
    @Body() body: Partial<CreateAssignmentDto>,
  ) {
    return this.assignmentsService.updateAssignment(id, body);
  }

  @Delete(':id')
  async deleteAssignment(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(id);
  }
}
