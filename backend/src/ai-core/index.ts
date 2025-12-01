import { AIBrain } from "./brain";
import { AIMonitoring } from "./monitoring";
import { TaskQueue } from "./queue";
import { AIScheduler } from "./scheduler";
import { WorkflowEngine } from "./workflow-engine";

export class AICore {
  private static instance: AICore;
  private initialized = false;

  private workflowEngine?: WorkflowEngine;
  private taskQueue?: TaskQueue;
  private monitoring?: AIMonitoring;
  private scheduler?: AIScheduler;
  private brain?: AIBrain;

  private constructor() {
    // Lazy initialization to avoid circular dependencies
  }

  static getInstance(): AICore {
    if (!AICore.instance) {
      AICore.instance = new AICore();
    }
    return AICore.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("AI Core already initialized");
      return;
    }

    console.log("🤖 Initializing AI Core System...");

    try {
      // Initialize components in order (lazy-loaded to avoid circular dependencies)
      console.log("  ✓ Initializing AI Brain...");
      this.brain = AIBrain.getInstance();
      await this.brain.initialize();

      console.log("  ✓ Initializing Task Queue...");
      this.taskQueue = TaskQueue.getInstance();
      await this.taskQueue.initialize();

      console.log("  ✓ Initializing Workflow Engine...");
      this.workflowEngine = WorkflowEngine.getInstance();
      await this.workflowEngine.initialize();

      console.log("  ✓ Initializing Monitoring...");
      this.monitoring = AIMonitoring.getInstance();
      await this.monitoring.initialize();

      console.log("  ✓ Initializing Scheduler...");
      this.scheduler = AIScheduler.getInstance();
      await this.scheduler.initialize();

      this.initialized = true;
      console.log("✅ AI Core System initialized successfully");

      // Create initialization success alert
      await this.monitoring.createAlert({
        type: "system-info",
        severity: "LOW",
        message: "AI Core System initialized successfully",
        details: {
          timestamp: new Date().toISOString(),
          components: [
            "Brain",
            "TaskQueue",
            "WorkflowEngine",
            "Monitoring",
            "Scheduler",
          ],
        },
      });
    } catch (error) {
      console.error("❌ Failed to initialize AI Core:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log("🤖 Shutting down AI Core System...");

    try {
      if (this.scheduler) await this.scheduler.shutdown();
      if (this.taskQueue) await this.taskQueue.shutdown();
      if (this.monitoring) await this.monitoring.shutdown();
      if (this.workflowEngine) await this.workflowEngine.shutdown();

      this.initialized = false;
      console.log("✅ AI Core System shut down successfully");
    } catch (error) {
      console.error("❌ Error during AI Core shutdown:", error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getWorkflowEngine(): WorkflowEngine {
    if (!this.workflowEngine) throw new Error("AI Core not initialized");
    return this.workflowEngine;
  }

  getTaskQueue(): TaskQueue {
    if (!this.taskQueue) throw new Error("AI Core not initialized");
    return this.taskQueue;
  }

  getMonitoring(): AIMonitoring {
    if (!this.monitoring) throw new Error("AI Core not initialized");
    return this.monitoring;
  }

  getScheduler(): AIScheduler {
    if (!this.scheduler) throw new Error("AI Core not initialized");
    return this.scheduler;
  }

  getBrain(): AIBrain {
    if (!this.brain) throw new Error("AI Core not initialized");
    return this.brain;
  }

  async getSystemStatus(): Promise<any> {
    if (!this.monitoring || !this.scheduler) {
      throw new Error("AI Core not initialized");
    }

    const health = await this.monitoring.checkSystemHealth();
    const stats = await this.monitoring.getStats();
    const scheduledJobs = this.scheduler.getScheduledJobs();

    return {
      initialized: this.initialized,
      health,
      stats,
      scheduledJobs: scheduledJobs.length,
      components: {
        brain: true,
        taskQueue: true,
        workflowEngine: true,
        monitoring: true,
        scheduler: true,
      },
    };
  }
}

export const aiCore = AICore.getInstance();

// Export individual components
export { AIBrain, AIMonitoring, AIScheduler, TaskQueue, WorkflowEngine };
