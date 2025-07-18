import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as fs from 'fs';
if (!global.crypto?.subtle) {
  const { webcrypto } = require('crypto');
  (global as any).crypto = webcrypto;
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['set-cookie', 'authorization'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ✅ Serving static files from public
  const publicPath = join(process.cwd(), 'server', 'public');
  if (!fs.existsSync(publicPath)) {
    console.warn('⚠️ Warning: public folder not found at:', publicPath);
  }
  console.log('🧩 Serving static files from:', publicPath);
  app.useStaticAssets(publicPath);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
