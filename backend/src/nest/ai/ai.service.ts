import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export interface AiJobResult {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  result?: string;
  error?: string;
}

// In-memory job store (for demo - use Redis/BullMQ in production)
const jobStore = new Map<string, { status: string; result?: string; type: string }>();

@Injectable()
export class AiService {
  async generateContent(prompt: string, userId: string): Promise<{ jobId: string }> {
    const jobId = randomUUID();

    // Simulate async processing
    jobStore.set(jobId, { status: "processing", type: "content-generation" });

    setTimeout(() => {
      jobStore.set(jobId, {
        status: "completed",
        type: "content-generation",
        result: `Generated content for: "${prompt.substring(0, 50)}..."`,
      });
    }, 1000);

    return { jobId };
  }

  async summarize(text: string, userId: string): Promise<{ jobId: string }> {
    const jobId = randomUUID();

    jobStore.set(jobId, { status: "processing", type: "summarization" });

    setTimeout(() => {
      const words = text.split(" ");
      const summary = words.slice(0, Math.min(20, words.length)).join(" ");
      jobStore.set(jobId, {
        status: "completed",
        type: "summarization",
        result: `Summary: ${summary}...`,
      });
    }, 500);

    return { jobId };
  }

  async analyze(text: string, userId: string): Promise<{ jobId: string }> {
    const jobId = randomUUID();

    jobStore.set(jobId, { status: "processing", type: "analysis" });

    setTimeout(() => {
      jobStore.set(jobId, {
        status: "completed",
        type: "analysis",
        result: JSON.stringify({
          wordCount: text.split(" ").length,
          charCount: text.length,
          sentiment: "neutral",
          topics: ["general"],
        }),
      });
    }, 500);

    return { jobId };
  }

  async getJobStatus(jobId: string): Promise<AiJobResult> {
    const job = jobStore.get(jobId);

    if (!job) {
      return {
        jobId,
        status: "failed",
        error: "Job not found",
      };
    }

    return {
      jobId,
      status: job.status as AiJobResult["status"],
      result: job.result,
    };
  }
}
