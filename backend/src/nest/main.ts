import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import "reflect-metadata";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix("api/v2");

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = process.env.NEST_PORT || 4001;
  await app.listen(port);

  console.log(`🚀 NestJS server running on http://localhost:${port}/api/v2`);
  console.log(`📚 Health check: http://localhost:${port}/api/v2/health`);
}

bootstrap().catch((err) => {
  console.error("Failed to start NestJS application:", err);
  process.exit(1);
});
