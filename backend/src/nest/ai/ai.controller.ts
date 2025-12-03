import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AiJobResult, AiService } from "./ai.service";
import { AnalyzeDto, GenerateContentDto, SummarizeDto } from "./dto/ai.dto";

@ApiTags("ai")
@ApiBearerAuth("JWT-auth")
@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate AI content from prompt" })
  @ApiResponse({ status: 201, description: "Job created successfully" })
  async generateContent(
    @Request() req: { user: { id: string } },
    @Body() dto: GenerateContentDto
  ): Promise<{ jobId: string }> {
    return this.aiService.generateContent(dto.prompt, req.user.id);
  }

  @Post("summarize")
  @ApiOperation({ summary: "Summarize text using AI" })
  @ApiResponse({ status: 201, description: "Job created successfully" })
  async summarize(@Request() req: { user: { id: string } }, @Body() dto: SummarizeDto): Promise<{ jobId: string }> {
    return this.aiService.summarize(dto.text, req.user.id);
  }

  @Post("analyze")
  @ApiOperation({ summary: "Analyze text using AI" })
  @ApiResponse({ status: 201, description: "Job created successfully" })
  async analyze(@Request() req: { user: { id: string } }, @Body() dto: AnalyzeDto): Promise<{ jobId: string }> {
    return this.aiService.analyze(dto.text, req.user.id);
  }

  @Get("jobs/:jobId")
  @ApiOperation({ summary: "Get AI job status and result" })
  @ApiResponse({ status: 200, description: "Job status retrieved" })
  @ApiResponse({ status: 404, description: "Job not found" })
  async getJobStatus(@Param("jobId") jobId: string): Promise<AiJobResult> {
    return this.aiService.getJobStatus(jobId);
  }
}
