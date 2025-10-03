import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentSchema, SubmissionSchema } from './schemas/assignment.schema';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { GeminiService } from '../common/gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Assignment', schema: AssignmentSchema },
      { name: 'Submission', schema: SubmissionSchema },
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, GeminiService],
})
export class AssignmentsModule {}
