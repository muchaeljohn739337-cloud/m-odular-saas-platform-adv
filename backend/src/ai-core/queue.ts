import { PrismaClient } from "@prisma/client";
import { Job, Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { logger } from "../utils/logger";

// Local enums mirroring Prisma enums
const TaskStatusEnum = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
const WorkflowStatusEnum = {
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
  AWAITING_APPROVAL: "AWAITING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const prisma = new PrismaClient();

// Redis connection (optional - only if REDIS_HOST/REDIS_URL is set)
let connection: Redis | null = null;

// Completely disable Redis for local development without Redis server
// if (process.env.REDIS_HOST || process.env.REDIS_URL) {
//   connection = new Redis({
//     host: process.env.REDIS_HOST || "localhost",
//     port: parseInt(process.env.REDIS_PORT || "6379"),
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false,
//     retryStrategy: () => null, // Don't retry on connection failure
//   });

//   connection.on("error", (err) => {
//     console.warn("⚠️  Redis connection error in AI queue:", err.message);
//   });
// } else {
console.warn("⚠️  Redis not configured for AI queue system. Queue features will be disabled.");
// }

// Queue names
export enum QueueName {
  AI_WORKFLOW = "ai-workflow",
  AI_TASK = "ai-task",
  AI_MONITORING = "ai-monitoring",
  AI_REPORT = "ai-report",
  AI_CODE_SUGGESTION = "ai-code-suggestion",
}

// Task priorities
export enum TaskPriority {
  CRITICAL = 1,
  HIGH = 3,
  MEDIUM = 5,
  LOW = 7,
  BACKGROUND = 10,
}

// Queue configurations (only if Redis is available)
let queueConfig: any = null;
let queues: any = null;
let queueEvents: any = null;

if (connection) {
  queueConfig = {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500, // Keep last 500 failed jobs for debugging
    },
  };

  // Create queues
  queues = {
    workflow: new Queue(QueueName.AI_WORKFLOW, queueConfig),
    task: new Queue(QueueName.AI_TASK, queueConfig),
    monitoring: new Queue(QueueName.AI_MONITORING, queueConfig),
    report: new Queue(QueueName.AI_REPORT, queueConfig),
    codeSuggestion: new Queue(QueueName.AI_CODE_SUGGESTION, queueConfig),
  };

  // Queue events for monitoring
  queueEvents = {
    workflow: new QueueEvents(QueueName.AI_WORKFLOW, { connection }),
    task: new QueueEvents(QueueName.AI_TASK, { connection }),
    monitoring: new QueueEvents(QueueName.AI_MONITORING, { connection }),
    report: new QueueEvents(QueueName.AI_REPORT, { connection }),
    codeSuggestion: new QueueEvents(QueueName.AI_CODE_SUGGESTION, {
      connection,
    }),
  };

  // Listen to queue events
  Object.entries(queueEvents).forEach(([name, events]: [string, QueueEvents]) => {
    events.on("completed", ({ jobId }: { jobId: string }) => {
      logger.info(`Job completed in ${name}: ${jobId}`);
    });

    events.on("failed", ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
      logger.error(`Job failed in ${name}: ${jobId} - ${failedReason}`);
    });

    events.on("progress", ({ jobId, data }: { jobId: string; data: any }) => {
      logger.debug(`Job progress in ${name}: ${jobId} - ${JSON.stringify(data)}`);
    });
  });
}

// Export queues (will be null if Redis not available)
export { queues };

// Job data interfaces
export interface WorkflowJobData {
  workflowId: string;
  triggeredBy: string;
  triggerData?: any;
}

export interface TaskJobData {
  taskId: string;
  workflowId?: string;
  executionId?: string;
  taskType: string;
  input: any;
  priority: number;
  requiresApproval: boolean;
}

export interface MonitoringJobData {
  checkType: string; // 'health', 'performance', 'security', 'errors'
  targets: string[];
  config?: any;
}

export interface ReportJobData {
  reportType: string;
  category: string;
  dateFrom: Date;
  dateTo: Date;
  config?: any;
}

export interface CodeSuggestionJobData {
  suggestionType: string;
  filePath?: string;
  context: any;
  triggeredBy: string;
}

// Add jobs to queues
export class AIQueueManager {
  /**
   * Schedule a workflow execution
   */
  static async scheduleWorkflow(
    data: WorkflowJobData,
    options?: {
      priority?: TaskPriority;
      delay?: number;
      repeat?: {
        pattern: string; // cron pattern
      };
    }
  ): Promise<Job<WorkflowJobData> | null> {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    return queues.workflow.add("execute-workflow", data, {
      priority: options?.priority || TaskPriority.MEDIUM,
      delay: options?.delay,
      repeat: options?.repeat,
    });
  }

  /**
   * Schedule a task
   */
  static async scheduleTask(
    data: TaskJobData,
    options?: {
      priority?: TaskPriority;
      delay?: number;
    }
  ): Promise<Job<TaskJobData> | null> {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    return queues.task.add("execute-task", data, {
      priority: options?.priority || data.priority || TaskPriority.MEDIUM,
      delay: options?.delay,
    });
  }

  /**
   * Schedule monitoring check
   */
  static async scheduleMonitoring(
    data: MonitoringJobData,
    options?: {
      repeat?: {
        pattern: string;
      };
    }
  ): Promise<Job<MonitoringJobData> | null> {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    return queues.monitoring.add("run-monitoring", data, {
      priority: TaskPriority.HIGH,
      repeat: options?.repeat,
    });
  }

  /**
   * Schedule report generation
   */
  static async scheduleReport(
    data: ReportJobData,
    options?: {
      delay?: number;
      repeat?: {
        pattern: string;
      };
    }
  ): Promise<Job<ReportJobData> | null> {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    return queues.report.add("generate-report", data, {
      priority: TaskPriority.LOW,
      delay: options?.delay,
      repeat: options?.repeat,
    });
  }

  /**
   * Schedule code suggestion analysis
   */
  static async scheduleCodeSuggestion(data: CodeSuggestionJobData): Promise<Job<CodeSuggestionJobData> | null> {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    return queues.codeSuggestion.add("analyze-code", data, {
      priority: TaskPriority.MEDIUM,
    });
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(queueName: QueueName) {
    if (!queues) {
      logger.warn("Queue system not available (Redis not configured)");
      return null;
    }
    const queue = Object.values(queues).find((q: Queue) => q.name === queueName) as Queue | undefined;
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Get all queue statistics
   */
  static async getAllQueueStats() {
    if (!queues) {
      return [];
    }
    const stats = await Promise.all(
      Object.entries(queues).map(async ([name, queue]: [string, Queue]) => ({
        name,
        queueName: queue.name,
        stats: await this.getQueueStats(queue.name as QueueName),
      }))
    );

    return stats;
  }

  /**
   * Pause a queue
   */
  static async pauseQueue(queueName: QueueName) {
    const queue = Object.values(queues).find((q) => q.name === queueName);
    if (queue) {
      await queue.pause();
      logger.info(`Queue paused: ${queueName}`);
    }
  }

  /**
   * Resume a queue
   */
  static async resumeQueue(queueName: QueueName) {
    const queue = Object.values(queues).find((q) => q.name === queueName);
    if (queue) {
      await queue.resume();
      logger.info(`Queue resumed: ${queueName}`);
    }
  }

  /**
   * Clean old jobs from queue
   */
  static async cleanQueue(
    queueName: QueueName,
    grace: number = 3600000, // 1 hour
    status: TaskStatusEnum.COMPLETED | TaskStatusEnum.FAILED = TaskStatusEnum.COMPLETED
  ) {
    const queue = Object.values(queues).find((q) => q.name === queueName);
    if (queue) {
      await queue.clean(grace, 1000, status);
      logger.info(`Queue cleaned: ${queueName} (${status})`);
    }
  }

  /**
   * Drain queue (remove all jobs)
   */
  static async drainQueue(queueName: QueueName) {
    const queue = Object.values(queues).find((q) => q.name === queueName);
    if (queue) {
      await queue.drain();
      logger.warn(`Queue drained: ${queueName}`);
    }
  }

  /**
   * Get job by ID
   */
  static async getJob(queueName: QueueName, jobId: string) {
    const queue = Object.values(queues).find((q) => q.name === queueName);
    if (queue) {
      return queue.getJob(jobId);
    }
    return null;
  }

  /**
   * Retry a failed job
   */
  static async retryJob(queueName: QueueName, jobId: string) {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.retry();
      logger.info(`Job retried: ${queueName}/${jobId}`);
    }
  }

  /**
   * Remove a job
   */
  static async removeJob(queueName: QueueName, jobId: string) {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
      logger.info(`Job removed: ${queueName}/${jobId}`);
    }
  }
}

// Health check
export async function checkQueuesHealth(): Promise<{
  healthy: boolean;
  redis: boolean;
  queues: any;
}> {
  try {
    // Check Redis connection
    const redisHealth = await connection.ping();

    // Check each queue
    const queueHealth = await AIQueueManager.getAllQueueStats();

    return {
      healthy: redisHealth === "PONG",
      redis: redisHealth === "PONG",
      queues: queueHealth,
    };
  } catch (error) {
    logger.error("Queue health check failed:", error);
    return {
      healthy: false,
      redis: false,
      queues: {},
    };
  }
}

// Graceful shutdown
export async function closeQueues() {
  logger.info("Closing AI queues...");

  await Promise.all([
    ...Object.values(queues).map((q) => q.close()),
    ...Object.values(queueEvents).map((e) => e.close()),
    connection.quit(),
  ]);

  logger.info("All queues closed");
}

// Export for shutdown handling
process.on("SIGTERM", closeQueues);
process.on("SIGINT", closeQueues);

/**
 * TaskQueue - Singleton wrapper for AI Core integration
 */
export class TaskQueue {
  private static instance: TaskQueue;
  private initialized = false;

  private constructor() {}

  static getInstance(): TaskQueue {
    if (!TaskQueue.instance) {
      TaskQueue.instance = new TaskQueue();
    }
    return TaskQueue.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.info("Initializing Task Queue system...");

    // Test Redis connection
    try {
      await connection.ping();
      logger.info("✓ Redis connection established");
    } catch (error) {
      logger.error("✗ Redis connection failed:", error);
      throw new Error("Failed to connect to Redis. Ensure Redis is running.");
    }

    this.initialized = true;
    logger.info("✓ Task Queue initialized");
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await closeQueues();
    this.initialized = false;
  }

  // Proxy methods to AIQueueManager
  scheduleWorkflow = AIQueueManager.scheduleWorkflow;
  scheduleTask = AIQueueManager.scheduleTask;
  scheduleMonitoring = AIQueueManager.scheduleMonitoring;
  scheduleReport = AIQueueManager.scheduleReport;
  scheduleCodeSuggestion = AIQueueManager.scheduleCodeSuggestion;
  getJobStatus = AIQueueManager.getJobStatus;
  cancelJob = AIQueueManager.cancelJob;
  retryJob = AIQueueManager.retryJob;
  getQueueMetrics = AIQueueManager.getQueueMetrics;

  /**
   * Add a new task to the queue
   */
  async addTask(params: {
    workflowId?: string;
    type: string;
    data: any;
    priority?: number;
    requiresApproval?: boolean;
  }) {
    const task = await prisma.ai_tasks.create({
      data: {
        workflowId: params.workflowId,
        taskType: params.type,
        priority: params.priority || 5,
        status: params.requiresApproval ? "awaiting_approval" : "pending",
        input: JSON.stringify(params.data),
      },
    });

    // Queue task if it doesn't require approval
    if (!params.requiresApproval) {
      await AIQueueManager.scheduleTask({
        taskId: task.id,
        workflowId: params.workflowId,
        taskType: task.taskType,
        input: params.data,
        priority: task.priority,
        requiresApproval: false,
      });
    }

    return task;
  }

  /**
   * Retry a failed task
   */
  async retryTask(taskId: string) {
    const task = await prisma.ai_tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status !== "failed" && task.status !== "error") {
      throw new Error(`Task is not in a failed state: ${task.status}`);
    }

    // Update task status
    const updatedTask = await prisma.ai_tasks.update({
      where: { id: taskId },
      data: {
        status: TaskStatusEnum.PENDING,
        result: null,
        error: null,
      },
    });

    // Re-queue the task
    await AIQueueManager.scheduleTask({
      taskId: task.id,
      workflowId: task.workflowId || undefined,
      executionId: task.executionId || undefined,
      taskType: task.taskType,
      input: JSON.parse(task.input),
      priority: task.priority,
      requiresApproval: false,
    });

    return updatedTask;
  }
}
