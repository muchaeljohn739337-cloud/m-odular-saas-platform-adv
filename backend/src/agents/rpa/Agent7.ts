import { BaseAgent } from "../BaseAgent";

export class RpaAgent7 extends BaseAgent {
  constructor() {
    super("RpaAgent7", "Checks fraud detection system status.");
  }

  async run() {
    await new Promise(res => setTimeout(res, 100));
    this.updateStatus("success", { fraudDetection: "Active" });
  }
}