import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInteractionDto } from '../dto/create-interaction.dto';

@Injectable()
export class InteractionWaliService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateInteractionDto) {
  return this.prisma.interactionWali.create({
    data: {
      ...data,
      date_interaction: new Date(data.date_interaction), // Ensure it's full ISO date
    }
  });
}

  findByProcedure(id_procedure: number) {
    return this.prisma.interactionWali.findMany({
      where: { id_procedure },
      orderBy: { date_interaction: 'asc' },
    });
  }
}
