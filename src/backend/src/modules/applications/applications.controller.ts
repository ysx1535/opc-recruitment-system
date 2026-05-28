import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationQueryDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('申请管理')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: '创建申请记录' })
  create(@Body() dto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: '获取申请列表' })
  findAll(@Query() query: ApplicationQueryDto) {
    return this.applicationsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取申请统计' })
  getStats() {
    return this.applicationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取申请详情' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新申请状态' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    return this.applicationsService.updateStatus(id, dto, req.user?.id);
  }
}
