import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

// ----------------------------------------------------------------------

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // OPENAPI
  const config = new DocumentBuilder()
    .setTitle('Coral API')
    .setDescription('Comprehensive API documentation for the Coral platform.')
    .setVersion('1.0')
    .addTag('Coral')
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 8001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
