import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneratePermisController } from './permis.controller';
import { GeneratePermisService } from './permis.service';

@Module({
  controllers: [GeneratePermisController],
  providers: [GeneratePermisService, PrismaService]
})
export class GeneratePermisModule {}
