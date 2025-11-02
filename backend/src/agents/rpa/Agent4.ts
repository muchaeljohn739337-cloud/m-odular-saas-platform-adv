import { BaseAgent } from "../BaseAgent";

export class RpaAgent4 extends BaseAgent {
  constructor() {
    super("RpaAgent4", "Checks user authentication service.");
  }

  async run() {
    await new Promise(res => setTimeout(res, 100));
    this.updateStatus("success", { authStatus: "All good" });
  }
}