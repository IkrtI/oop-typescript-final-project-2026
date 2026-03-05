import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Request, Response } from "express";
import { existsSync } from "fs";
import { join } from "path";
import { AppModule } from "../app.module";

function resolveFrontendPath(): string {
  const candidates = [
    join(process.cwd(), "frontend"),
    join(__dirname, "..", "..", "frontend"),
    join(__dirname, "..", "..", "..", "frontend"),
  ];

  return candidates.find((path) => existsSync(join(path, "index.html"))) ?? candidates[0];
}

export async function createConfiguredApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendPath = resolveFrontendPath();

  app.useStaticAssets(frontendPath, {
    prefix: "/app/",
  });

  app
    .getHttpAdapter()
    .getInstance()
    .get("/app", (_req: Request, res: Response) => {
      res.sendFile(join(frontendPath, "index.html"));
    });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("E-commerce Basic API")
    .setDescription(
      "NestJS Backend API for E-commerce Basic Project (Model Set 5)\n\n" +
        "## Core Models\n" +
        "- **Product** — สินค้าในระบบ\n" +
        "- **Order** — คำสั่งซื้อ\n\n" +
        "- **Customer** — ลูกค้าในระบบ\n\n" +
        "Swagger docs: /api",
    )
    .setVersion("1.0")
    .addTag("Products", "จัดการสินค้า")
    .addTag("Orders", "จัดการคำสั่งซื้อ")
    .addTag("Customers", "จัดการลูกค้าและประวัติการซื้อ")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.init();
  return app;
}
