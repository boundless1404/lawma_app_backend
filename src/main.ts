import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import processEnvObj from './config/envs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appName = processEnvObj.PROJECT_NAME || 'Nest Js app';
  const port = Number(processEnvObj.SERVER_PORT || 5000);
  await app.listen(port);
  Logger.log('', `${appName} started on port ${port}`);
}
bootstrap();
