import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 全局模块，其他模块可直接注入 PrismaService
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
