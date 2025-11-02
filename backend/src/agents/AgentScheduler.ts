import cron from "node-cron";
import { BaseAgent } from "./BaseAgent";

export class AgentScheduler {
  private agents: BaseAgent[];

  constructor(agents: BaseAgent[]) {
    this.agents = agents;
  }

  scheduleAll(cronPattern = "*/5 * * * *") {
    this.agents.forEach(agent => {
      cron.schedule(cronPattern, async () => {
        agent.metadata.status = "running";
        try {
          await agent.run();
          agent.updateStatus("success");
        } catch (err) {
          agent.updateStatus("error", err instanceof Error ? err.message : String(err));
        }
      });
    });
  }

  getAgentMetadata() {
    return this.agents.map(a => a.metadata);
  }

  async runAllOnce() {
    for (const agent of this.agents) {
      agent.metadata.status = "running";
      try {
        await agent.run();
        agent.updateStatus("success");
      } catch (err) {
        agent.updateStatus("error", err instanceof Error ? err.message : String(err));
      }
    }
  }
}