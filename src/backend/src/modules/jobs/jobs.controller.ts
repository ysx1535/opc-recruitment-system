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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from './dto/job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Job Management')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create job posting' })
  create(@Body() dto: CreateJobDto, @Request() req) {
    return this.jobsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get job list (public)' })
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job statistics' })
  getStats(@Request() req) {
    return this.jobsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job details (public)' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findPublic(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job posting' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Request() req,
  ) {
    // PASS role to service for hybrid permission check
    return this.jobsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job posting' })
  remove(@Param('id') id: string, @Request() req) {
    // PASS role to service for hybrid permission check
    return this.jobsService.remove(id, req.user.id, req.user.role);
  }
}