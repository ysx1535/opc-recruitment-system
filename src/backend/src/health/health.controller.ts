import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Returns OK if service is running' })
  async checkHealth(): Promise<object> {
    this.logger.log('GET /health called');
    return this.healthService.checkHealth();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Returns detailed health status' })
  async checkDetailedHealth(): Promise<object> {
    this.logger.log('GET /health/detailed called');
    return this.healthService.checkDetailedHealth();
  }

  @Get('db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Returns database health status' })
  async checkDatabase(): Promise<object> {
    this.logger.log('GET /health/db called');
    return this.healthService.checkDatabaseHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Returns ready if all dependencies are available' })
  async checkReadiness(): Promise<object> {
    this.logger.log('GET /health/ready called');
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Returns alive if service is running' })
  async checkLiveness(): Promise<object> {
    this.logger.log('GET /health/live called');
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
