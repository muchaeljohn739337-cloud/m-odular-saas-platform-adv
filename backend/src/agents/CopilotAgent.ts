/**
 * CopilotAgent.ts
 *
 * Scheduled agent for autonomous codebase analysis and suggestions.
 */

import { copilotService } from "../ai/copilot/CopilotService";
import { AgentContext, AgentResult, BaseAgent } from "./BaseAgent";

export class CopilotAgent extends BaseAgent {
  constructor(context: AgentContext) {
    super("CopilotAgent", context);
  }

  async execute(): Promise<AgentResult> {
    try {
      this.logger.info("[CopilotAgent] Starting autonomous analysis...");

      await copilotService.initialize();

      const analysis = await copilotService.chat(
        1, // System user ID
        "Analyze recent code changes and suggest 3 optimization opportunities",
        "copilot-agent-session"
      );

      this.logger.info("[CopilotAgent] Analysis complete", {
        response: analysis,
      });

      return {
        success: true,
        message: "Autonomous analysis completed",
        data: { analysis },
      };
    } catch (error: any) {
      this.logger.error("[CopilotAgent] Execution failed", {
        error: error.message,
      });
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
