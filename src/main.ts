import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { initWinston, winstonLogger } from '@libs/common/logging';

async function bootstrap() {
  initWinston('Application');

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(3000);

  const url = await app.getUrl();
  winstonLogger?.info(`🚀 Application is running on port: ${url}`);
}
bootstrap();
