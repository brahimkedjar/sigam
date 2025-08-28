// interaction-wali.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInteractionDto } from '../dto/create-interaction.dto';

@Injectable()
export class InteractionWaliService {
  constructor(private prisma: PrismaService) {}

 create(data: CreateInteractionDto) {
  return this.prisma.interactionWali.create({
    data: {
      type_interaction: data.type_interaction,
      date_interaction: new Date(data.date_interaction),
      avis_wali: data.avis_wali,
      remarques: data.remarques,
      contenu: data.contenu,
      is_relance: data.is_relance ?? false,
      Procedure: {
        connect: { id_proc: data.id_procedure }
      },
      Wilaya: {
        connect: { id_wilaya: data.id_wilaya }
      }
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