import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000;
  app.enableCors({ origin: true });
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
