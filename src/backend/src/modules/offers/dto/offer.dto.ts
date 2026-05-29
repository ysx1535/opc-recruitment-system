import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty({ description: 'Application ID' })
  @IsUUID()
  applicationId!: string;

  @ApiProperty()
  @IsNumber()
  salary!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  equity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OfferQueryDto {
  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}