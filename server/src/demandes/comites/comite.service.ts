// comites/comite.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComiteDto } from '../dto/create-comite.dto';

@Injectable()
export class ComiteService {
  constructor(private prisma: PrismaService) {}

  async createComite(createComiteDto: CreateComiteDto) {
    return this.prisma.comiteDirection.create({
      data: {
        id_seance: createComiteDto.id_seance,
        date_comite: createComiteDto.date_comite,
        numero_decision: createComiteDto.numero_decision,
        objet_deliberation: createComiteDto.objet_deliberation,
        resume_reunion: createComiteDto.resume_reunion,
        fiche_technique: createComiteDto.fiche_technique,
        carte_projettee: createComiteDto.carte_projettee,
        rapport_police: createComiteDto.rapport_police,
        instructeur: createComiteDto.instructeur
      }
    });
  }

  async updateComite(id: number, updateComiteDto: CreateComiteDto) {
    return this.prisma.comiteDirection.update({
      where: { id_comite: id },
      data: {
        date_comite: updateComiteDto.date_comite,
        numero_decision: updateComiteDto.numero_decision,
        objet_deliberation: updateComiteDto.objet_deliberation,
        resume_reunion: updateComiteDto.resume_reunion,
        fiche_technique: updateComiteDto.fiche_technique,
        carte_projettee: updateComiteDto.carte_projettee,
        rapport_police: updateComiteDto.rapport_police,
        instructeur: updateComiteDto.instructeur
      }
    });
  }
}