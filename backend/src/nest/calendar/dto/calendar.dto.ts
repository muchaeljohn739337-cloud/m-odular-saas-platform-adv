import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export enum RecurringType {
  NONE = "NONE",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export class CreateCalendarDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(RecurringType)
  @IsOptional()
  recurring?: RecurringType;

  @IsArray()
  @IsOptional()
  reminders?: number[]; // Minutes before event

  @IsString()
  @IsOptional()
  calendarId?: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(RecurringType)
  @IsOptional()
  recurring?: RecurringType;

  @IsArray()
  @IsOptional()
  reminders?: number[];
}
