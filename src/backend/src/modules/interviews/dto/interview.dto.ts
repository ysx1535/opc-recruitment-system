import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewType, InterviewStatus } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Application ID' })
  @IsUUID()
  applicationId!: string;

  @ApiProperty({ description: 'Interviewer ID' })
  @IsUUID()
  interviewerId!: string;

  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType)
  type!: InterviewType;

  @ApiProperty({ description: 'Scheduled datetime' })
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class UpdateInterviewDto {
  @ApiPropertyOptional({ enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transcript?: string;
}

export class CreateEvaluationDto {
  @ApiProperty({ description: 'Interview ID' })
  @IsUUID()
  interviewId!: string;

  @ApiProperty({ description: 'Evaluator ID' })
  @IsUUID()
  evaluatorId!: string;

  @ApiProperty({ description: 'Scores JSON' })
  @IsObject()
  scores!: Record<string, number>;

  @ApiProperty()
  @IsNumber()
  overallScore!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  strengths?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  weaknesses?: Record<string, string>;

  @ApiProperty({ enum: ['STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO'] })
  @IsEnum(['STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO'])
  recommendation!: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InterviewQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  applicationId?: string;

  @ApiPropertyOptional({ enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ enum: InterviewType })
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}