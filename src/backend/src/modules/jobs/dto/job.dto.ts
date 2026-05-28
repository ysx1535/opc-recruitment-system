import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

// Prisma Schema enum values
export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE',
}

export class CreateJobDto {
  @ApiProperty({ example: '高级前端工程师' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '我们正在寻找...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '北京' })
  @IsString()
  location?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiPropertyOptional({ example: ['React', 'TypeScript', 'Node.js'] })
  @IsArray()
  @IsOptional()
  skills?: string[];
}

export class UpdateJobDto {
  @ApiProperty({ example: '高级前端工程师' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '我们正在寻找...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '北京' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ enum: JobStatus, example: JobStatus.PUBLISHED })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}

export class JobQueryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
