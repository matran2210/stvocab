import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS lên để FE (React) gọi API không bị lỗi Cross-Origin
  app.enableCors();

  // Nx mặc định để global prefix là 'api', cứ giữ nguyên cho chuẩn
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();