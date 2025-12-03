import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
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

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle("NestJS API")
    .setDescription("Modern NestJS backend API for modular SaaS platform")
    .setVersion("2.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .addTag("health", "Health check endpoints")
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management endpoints")
    .addTag("blog", "Blog/CMS endpoints")
    .addTag("ai", "AI services endpoints")
    .addTag("calendar", "Calendar management endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v2/docs", app, document, {
    customSiteTitle: "API Documentation",
    customfavIcon: "https://nestjs.com/img/logo-small.svg",
    customCss: ".swagger-ui .topbar { display: none }",
  });

  const port = process.env.NEST_PORT || 4001;
  await app.listen(port);

  console.log(`🚀 NestJS server running on http://localhost:${port}/api/v2`);
  console.log(`📚 Health check: http://localhost:${port}/api/v2/health`);
  console.log(`📖 API Docs: http://localhost:${port}/api/v2/docs`);
}

bootstrap().catch((err) => {
  console.error("Failed to start NestJS application:", err);
  process.exit(1);
});
