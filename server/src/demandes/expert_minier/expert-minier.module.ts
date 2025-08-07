import { Module } from '@nestjs/common';
import { ExpertMinierService } from './expert-minier.service';
import { ExpertMinierController } from './expert-minier.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ExpertMinierController],
  providers: [ExpertMinierService, PrismaService],
})
export class ExpertMinierModule {}