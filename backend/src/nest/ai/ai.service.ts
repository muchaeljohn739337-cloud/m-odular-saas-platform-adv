import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { PrismaService } from "../prisma/prisma.service";

export interface AiJobData {
  type: "content-generation" | "summarization" | "analysis" | "embedding";
  input: string;
  options?: Record<string, unknown>;
  userId: string;
}

export interface AiJobResult {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  result?: string;
  error?: string;
}

@Injectable()
export class AiService {
  constructor(
    @InjectQueue("ai-jobs") private readonly aiQueue: Queue,
    private readonly prisma: PrismaService
  ) {}

  async queueJob(data: AiJobData): Promise<{ jobId: string; status: string }> {
    const job = await this.aiQueue.add("process", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    return {
      jobId: job.id.toString(),
      status: "queued",
    };
  }

  async getJobStatus(jobId: string): Promise<AiJobResult> {
    const job = await this.aiQueue.getJob(jobId);

    if (!job) {
      return {
        jobId,
        status: "failed",
        error: "Job not found",
      };
    }

    const state = await job.getState();

    return {
      jobId,
      status: state as AiJobResult["status"],
      result: job.returnvalue,
    };
  }

  async generateContent(prompt: string, userId: string): Promise<{ jobId: string }> {
    const result = await this.queueJob({
      type: "content-generation",
      input: prompt,
      userId,
    });

    // Log the generation request
    await this.prisma.aiGeneration.create({
      data: {
        type: "content-generation",
        prompt,
        status: "PENDING",
        userId,
        jobId: result.jobId,
      },
    });

    return { jobId: result.jobId };
  }

  async summarize(text: string, userId: string): Promise<{ jobId: string }> {
    const result = await this.queueJob({
      type: "summarization",
      input: text,
      userId,
    });

    return { jobId: result.jobId };
  }

  async analyze(text: string, userId: string): Promise<{ jobId: string }> {
    const result = await this.queueJob({
      type: "analysis",
      input: text,
      userId,
    });

    return { jobId: result.jobId };
  }
}
