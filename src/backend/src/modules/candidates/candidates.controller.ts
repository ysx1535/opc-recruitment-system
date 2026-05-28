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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateQueryDto } from './dto/candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('候选人管理')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: '添加候选人' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取候选人列表' })
  findAll(@Query() query: CandidateQueryDto) {
    return this.candidatesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取候选人统计' })
  getStats() {
    return this.candidatesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取候选人详情' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新候选人信息' })
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除候选人' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}
