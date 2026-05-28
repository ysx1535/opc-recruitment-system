import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({ status: 200, description: 'Returns welcome message' })
  getHello(): string {
    this.logger.log('GET / called');
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Returns health status' })
  getHealth(): object {
    this.logger.log('GET /health called');
    return this.appService.getHealth();
  }

  @Get('info')
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({ status: 200, description: 'Returns application info' })
  getInfo(): object {
    return this.appService.getInfo();
  }
}
