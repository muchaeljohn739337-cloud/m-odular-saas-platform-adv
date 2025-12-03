import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AiJobResult, AiService } from "./ai.service";
import { AnalyzeDto, GenerateContentDto, SummarizeDto } from "./dto/ai.dto";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate")
  async generateContent(
    @Request() req: { user: { id: string } },
    @Body() dto: GenerateContentDto
  ): Promise<{ jobId: string }> {
    return this.aiService.generateContent(dto.prompt, req.user.id);
  }

  @Post("summarize")
  async summarize(@Request() req: { user: { id: string } }, @Body() dto: SummarizeDto): Promise<{ jobId: string }> {
    return this.aiService.summarize(dto.text, req.user.id);
  }

  @Post("analyze")
  async analyze(@Request() req: { user: { id: string } }, @Body() dto: AnalyzeDto): Promise<{ jobId: string }> {
    return this.aiService.analyze(dto.text, req.user.id);
  }

  @Get("jobs/:jobId")
  async getJobStatus(@Param("jobId") jobId: string): Promise<AiJobResult> {
    return this.aiService.getJobStatus(jobId);
  }
}
