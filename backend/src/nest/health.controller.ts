import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      example: {
        status: "ok",
        timestamp: "2025-12-03T11:52:58.000Z",
        version: "v2-nest",
        framework: "NestJS",
        database: "connected",
        uptime: 123.456,
      },
    },
  })
  async check() {
    let dbStatus = "disconnected";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "v2-nest",
      framework: "NestJS",
      database: dbStatus,
      uptime: process.uptime(),
    };
  }
}
