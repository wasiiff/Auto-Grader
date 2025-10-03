import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsModule } from './assignments/assignments.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI! , {
      autoCreate: true,
    }),
    AssignmentsModule,
  ],
})
export class AppModule {}
