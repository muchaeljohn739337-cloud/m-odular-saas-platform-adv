import { BaseAgent } from "../BaseAgent";

export class RpaAgent2 extends BaseAgent {
  constructor() {
    super("RpaAgent2", "Monitors transaction queue depth.");
  }

  async run() {
    await new Promise(res => setTimeout(res, 100));
    this.updateStatus("success", { queueDepth: 3 });
  }
}