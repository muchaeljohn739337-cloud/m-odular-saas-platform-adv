// Agent System - Type Definitions
// Defines interfaces and types for the RPA agent architecture

import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

export interface AgentConfig {
  name: string;
  enabled: boolean;
  schedule: string; // cron expression
  retryAttempts: number;
  timeout: number; // milliseconds
  priority: "low" | "medium" | "high" | "critical";
}

export interface AgentContext {
  prisma: PrismaClient;
  io?: SocketIOServer;
  logger: AgentLogger;
}

export interface AgentLogger {
  info(message: string, metadata?: any): void;
  warn(message: string, metadata?: any): void;
  error(message: string, error?: any): void;
  debug(message: string, metadata?: any): void;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  metrics?: {
    duration: number;
    itemsProcessed: number;
    errors: number;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected context: AgentContext;

  constructor(config: AgentConfig, context: AgentContext) {
    this.config = config;
    this.context = context;
  }

  abstract execute(): Promise<AgentResult>;

  async run(): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      this.context.logger.info(`[${this.config.name}] Starting execution`);

      const result = await this.execute();

      const duration = Date.now() - startTime;
      this.context.logger.info(
        `[${this.config.name}] Completed in ${duration}ms`,
        result
      );

      return {
        ...result,
        metrics: {
          duration,
          itemsProcessed: result.metrics?.itemsProcessed || 0,
          errors: result.metrics?.errors || 0,
        },
      };
    } catch (error) {
      this.context.logger.error(`[${this.config.name}] Failed`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        metrics: {
          duration: Date.now() - startTime,
          itemsProcessed: 0,
          errors: 1,
        },
      };
    }
  }
}
