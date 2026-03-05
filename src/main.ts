import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { existsSync } from "fs";
import { Request, Response } from "express";
import { AppModule } from "./app.module";

function resolveFrontendPath(): string {
  const candidates = [
    join(process.cwd(), "frontend"),
    join(__dirname, "..", "frontend"),
  ];

  return (
    candidates.find((candidate) => existsSync(join(candidate, "index.html"))) ??
    candidates[0]
  );
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendPath = resolveFrontendPath();

  // Serve frontend files from /frontend via /app.
  app.useStaticAssets(frontendPath, {
    prefix: "/app/",
  });

  app
    .getHttpAdapter()
    .getInstance()
    .get("/app", (_req: Request, res: Response) => {
      res.sendFile(join(frontendPath, "index.html"));
    });

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
    .setTitle("E-commerce Basic API")
    .setDescription(
      "NestJS Backend API for E-commerce Basic Project (Model Set 5)\n\n" +
        "## Core Models\n" +
        "- **Product** — สินค้าในระบบ\n" +
        "- **Order** — คำสั่งซื้อ\n\n" +
        "- **Customer** — ลูกค้าในระบบ\n\n" +
        "Swagger docs: http://localhost:3000/api",
    )
    .setVersion("1.0")
    .addTag("Products", "จัดการสินค้า")
    .addTag("Orders", "จัดการคำสั่งซื้อ")
    .addTag("Customers", "จัดการลูกค้าและประวัติการซื้อ")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
  console.log(`Frontend: http://localhost:${port}/app`);
}

bootstrap();
