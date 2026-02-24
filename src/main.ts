import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('E-commerce Basic API')
    .setDescription(
      'NestJS Backend API for E-commerce Basic Project (Model Set 5)\n\n' +
      '## Core Models\n' +
      '- **Product** — สินค้าในระบบ\n' +
      '- **Order** — คำสั่งซื้อ\n\n' +
      'Swagger docs: http://localhost:3000/api',
    )
    .setVersion('1.0')
    .addTag('Products', 'จัดการสินค้า')
    .addTag('Orders', 'จัดการคำสั่งซื้อ')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
