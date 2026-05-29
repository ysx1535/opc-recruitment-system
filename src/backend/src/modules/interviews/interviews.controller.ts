import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewsService } from './interviews.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateEvaluationDto,
  InterviewQueryDto,
} from './dto/interview.dto';
import { InterviewStatus } from '@prisma/client';

@ApiTags('Interviews')
@Controller('interviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new interview' })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all interviews' })
  findAll(@Query() query: InterviewQueryDto) {
    return this.interviewsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get interview statistics' })
  getStats() {
    return this.interviewsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update interview' })
  update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel interview' })
  cancel(@Param('id') id: string) {
    return this.interviewsService.cancel(id);
  }

  @Post(':id/evaluation')
  @ApiOperation({ summary: 'Create interview evaluation' })
  createEvaluation(@Param('id') id: string, @Body() dto: CreateEvaluationDto) {
    return this.interviewsService.createEvaluation({ ...dto, interviewId: id });
  }

  @Get(':id/evaluation')
  @ApiOperation({ summary: 'Get interview evaluation' })
  getEvaluation(@Param('id') id: string) {
    return this.interviewsService.getEvaluation(id);
  }
}