import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

export interface AgentConfig {
  name: string;
  enabled: boolean;
  schedule: string; // cron expression
  retryAttempts: number;
  timeout: number; // milliseconds
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
}

export interface AgentContext {
  prisma: PrismaClient;
  io?: SocketIOServer;
  logger: AgentLogger;
}

export interface AgentLogger {
  info(message: string, metadata?: unknown): void;
  warn(message: string, metadata?: unknown): void;
  error(message: string, error?: unknown): void;
  debug(message: string, metadata?: unknown): void;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: unknown;
  metrics?: {
    duration: number;
    itemsProcessed: number;
    errors: number;
  };
}

export abstract class BaseAgent {
  protected readonly config: AgentConfig;
  protected readonly context: AgentContext;
  private lastRunResult: AgentResult | null = null;
  private lastRunAt: Date | null = null;

  constructor(config: AgentConfig, context: AgentContext) {
    this.config = config;
    this.context = context;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  getName(): string {
    return this.config.name;
  }

  getLastRun(): AgentResult | null {
    return this.lastRunResult;
  }

  getLastRunAt(): Date | null {
    return this.lastRunAt;
  }

  protected abstract execute(): Promise<AgentResult>;

  async run(): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      this.context.logger.info(`[${this.config.name}] Starting execution`);

      const result = await this.execute();
      const duration = Date.now() - startTime;
      const completedAt = new Date();

      const normalizedResult: AgentResult = {
        ...result,
        metrics: {
          duration,
          itemsProcessed: result.metrics?.itemsProcessed ?? 0,
          errors: result.metrics?.errors ?? 0,
        },
      };

      this.context.logger.info(
        `[${this.config.name}] Completed in ${duration}ms`,
        normalizedResult
      );

      this.lastRunResult = normalizedResult;
      this.lastRunAt = completedAt;

      return normalizedResult;
    } catch (error) {
      const failureResult: AgentResult = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        metrics: {
          duration: Date.now() - startTime,
          itemsProcessed: 0,
          errors: 1,
        },
      };

      this.context.logger.error(`[${this.config.name}] Failed`, error);
      this.lastRunResult = failureResult;
      this.lastRunAt = new Date();

      return failureResult;
    }
  }
}
