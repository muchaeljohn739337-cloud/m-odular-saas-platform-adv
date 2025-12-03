import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { BlogModule } from "./blog/blog.module";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    UserModule,
    BlogModule,
    AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
