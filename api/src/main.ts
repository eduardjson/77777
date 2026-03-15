import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { corsOptions } from './config/cors-options.config';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT ?? 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );
  app.use((req, res, next) => {
    console.log('Body:', req.body);
    next();
  });

  app.enableCors(corsOptions);
  await app.listen(PORT);

  Logger.log(`Server started on port ${PORT}`);
}
bootstrap();
