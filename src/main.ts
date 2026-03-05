import { createConfiguredApp } from "./platform/bootstrap-app";

async function bootstrap(): Promise<void> {
  const app = await createConfiguredApp();

  const port = 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
  console.log(`Frontend: http://localhost:${port}/app`);
}

bootstrap();
