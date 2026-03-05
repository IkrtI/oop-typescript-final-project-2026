import { Request, Response } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { createConfiguredApp } from "./src/platform/bootstrap-app";

let cachedApp: NestExpressApplication | null = null;

async function getOrCreateApp(): Promise<NestExpressApplication> {
  if (!cachedApp) {
    cachedApp = await createConfiguredApp();
  }

  return cachedApp;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const app = await getOrCreateApp();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}
