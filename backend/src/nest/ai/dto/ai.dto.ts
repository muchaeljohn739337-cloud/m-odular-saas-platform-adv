import { IsString, MaxLength, MinLength } from "class-validator";

export class GenerateContentDto {
  @IsString()
  @MinLength(3, { message: "Prompt must be at least 3 characters" })
  @MaxLength(10000, { message: "Prompt must not exceed 10000 characters" })
  prompt!: string;
}

export class SummarizeDto {
  @IsString()
  @MinLength(50, { message: "Text must be at least 50 characters to summarize" })
  @MaxLength(50000, { message: "Text must not exceed 50000 characters" })
  text!: string;
}

export class AnalyzeDto {
  @IsString()
  @MinLength(10, { message: "Text must be at least 10 characters to analyze" })
  @MaxLength(50000, { message: "Text must not exceed 50000 characters" })
  text!: string;
}
