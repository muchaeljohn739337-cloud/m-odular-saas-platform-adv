// Agent Scheduler - Orchestrates all RPA agents
// Initializes and schedules agent execution using node-cron

import cron, { ScheduledTask } from "node-cron";
import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";
import { AgentContext, AgentLogger } from "./types";

// Import all agents
import { MonitorAgent } from "./MonitorAgent";
import { TransactionAuditAgent } from "./TransactionAuditAgent";
import { CryptoRecoveryAgent } from "./CryptoRecoveryAgent";
import { UserSupportAgent } from "./UserSupportAgent";
import { AdminInsightAgent } from "./AdminInsightAgent";
import { SecurityFraudAgent } from "./SecurityFraudAgent";
import { CompliancePolicyAgent } from "./CompliancePolicyAgent";
import { CostOptimizationAgent } from "./CostOptimizationAgent";
import { DeployOrchestratorAgent } from "./DeployOrchestratorAgent";

// Simple logger implementation
const createLogger = (agentName: string): AgentLogger => ({
  info: (message: string, metadata?: any) => {
    console.log(
      `[${new Date().toISOString()}] [INFO] [${agentName}] ${message}`,
      metadata || ""
    );
  },
  warn: (message: string, metadata?: any) => {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${agentName}] ${message}`,
      metadata || ""
    );
  },
  error: (message: string, error?: any) => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${agentName}] ${message}`,
      error || ""
    );
  },
  debug: (message: string, metadata?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[${new Date().toISOString()}] [DEBUG] [${agentName}] ${message}`,
        metadata || ""
      );
    }
  },
});

export class AgentScheduler {
  private prisma: PrismaClient;
  private io?: SocketIOServer;
  private agents: any[] = [];
  private tasks: ScheduledTask[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  initialize(): void {
    console.log("[AgentScheduler] Initializing RPA agents...");

    // Create agent context
    const createContext = (agentName: string): AgentContext => ({
      prisma: this.prisma,
      io: this.io,
      logger: createLogger(agentName),
    });

    // Initialize all agents
    const monitorAgent = new MonitorAgent(createContext("MonitorAgent"));
    const transactionAuditAgent = new TransactionAuditAgent(
      createContext("TransactionAuditAgent")
    );
    const cryptoRecoveryAgent = new CryptoRecoveryAgent(
      createContext("CryptoRecoveryAgent")
    );
    const userSupportAgent = new UserSupportAgent(
      createContext("UserSupportAgent")
    );
    const adminInsightAgent = new AdminInsightAgent(
      createContext("AdminInsightAgent")
    );
    const securityFraudAgent = new SecurityFraudAgent(
      createContext("SecurityFraudAgent")
    );
    const compliancePolicyAgent = new CompliancePolicyAgent(
      createContext("CompliancePolicyAgent")
    );
    const costOptimizationAgent = new CostOptimizationAgent(
      createContext("CostOptimizationAgent")
    );
    const deployOrchestratorAgent = new DeployOrchestratorAgent(
      createContext("DeployOrchestratorAgent")
    );

    // Store agents for manual execution
    this.agents = [
      monitorAgent,
      transactionAuditAgent,
      cryptoRecoveryAgent,
      userSupportAgent,
      adminInsightAgent,
      securityFraudAgent,
      compliancePolicyAgent,
      costOptimizationAgent,
      deployOrchestratorAgent,
    ];

    // Schedule agents
    this.scheduleAgent(monitorAgent);
    this.scheduleAgent(transactionAuditAgent);
    this.scheduleAgent(cryptoRecoveryAgent);
    this.scheduleAgent(userSupportAgent);
    this.scheduleAgent(adminInsightAgent);
    this.scheduleAgent(securityFraudAgent);
    this.scheduleAgent(compliancePolicyAgent);
    this.scheduleAgent(costOptimizationAgent);
    this.scheduleAgent(deployOrchestratorAgent);

    console.log(`[AgentScheduler] ${this.agents.length} agents initialized`);
  }

  private scheduleAgent(agent: any): void {
    const config = (agent as any).config;

    if (!config.enabled) {
      console.log(`[AgentScheduler] ${config.name} is disabled, skipping`);
      return;
    }

    const task = cron.schedule(
      config.schedule,
      async () => {
        try {
          const result = await agent.run();
          console.log(
            `[AgentScheduler] ${config.name} completed:`,
            result.message
          );
        } catch (error) {
          console.error(`[AgentScheduler] ${config.name} failed:`, error);
        }
      },
      {
        timezone: "UTC",
      }
    );

    this.tasks.push(task);
    console.log(`[AgentScheduler] Scheduled ${config.name}: ${config.schedule}`);
  }

  async executeAgent(agentName: string): Promise<any> {
    const agent = this.agents.find((a) => a.config.name === agentName);

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    return await agent.run();
  }

  getAgentStatus(): any[] {
    return this.agents.map((agent) => ({
      name: agent.config.name,
      enabled: agent.config.enabled,
      schedule: agent.config.schedule,
      priority: agent.config.priority,
      retryAttempts: agent.config.retryAttempts,
      timeout: agent.config.timeout,
    }));
  }

  stop(): void {
    console.log("[AgentScheduler] Stopping all agents...");
    this.tasks.forEach((task) => task.stop());
    console.log("[AgentScheduler] All agents stopped");
  }
}

// Singleton instance
let schedulerInstance: AgentScheduler | null = null;

export const getAgentScheduler = (prisma: PrismaClient): AgentScheduler => {
  if (!schedulerInstance) {
    schedulerInstance = new AgentScheduler(prisma);
  }
  return schedulerInstance;
};
