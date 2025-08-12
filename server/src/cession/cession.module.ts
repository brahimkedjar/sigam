import { Module } from '@nestjs/common';
import { CessionController } from './cession.controller';
import { CessionService } from './cession.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CessionController],
  providers: [CessionService, PrismaService]
})
export class CessionModule {}
