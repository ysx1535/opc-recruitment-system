import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly startTime: Date;

  constructor(private configService: ConfigService) {
    this.startTime = new Date();
  }

  getHello(): string {
    this.logger.log('getHello() called');
    return '🦞 Welcome to OPC Recruitment System API!';
  }

  getHealth(): object {
    this.logger.log('getHealth() called');
    
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      env: this.configService.get('NODE_ENV') || 'development',
      version: '0.1.0',
    };
  }

  getInfo(): object {
    this.logger.log('getInfo() called');
    
    return {
      name: 'OPC Recruitment System',
      version: '0.1.0',
      description: 'AI-powered recruitment system for one-person companies',
      author: 'Your Name',
      license: 'MIT',
      environment: this.configService.get('NODE_ENV') || 'development',
      documentation: '/api/docs',
      health: '/api/health',
      timestamp: new Date().toISOString(),
    };
  }
}
