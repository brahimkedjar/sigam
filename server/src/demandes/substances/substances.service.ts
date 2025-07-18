import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubstancesService {
  constructor(private prisma: PrismaService) {}

  async findAll(famille?: string) {
  return this.prisma.substance.findMany({
    where: famille ? { catégorie_sub: famille } : {},
    orderBy: { nom_subFR: 'asc' } // Sort alphabetically
  });
}

async getSelectedByDemande(id_demande: number) {
  const demande = await this.prisma.demande.findUnique({
    where: { id_demande },
    select: {
      id_proc: true,
      procedure: {
        select: {
          SubstanceAssocieeDemande: {
            select: {
              substance: true
            }
          }
        }
      }
    }
  });

  return demande?.procedure?.SubstanceAssocieeDemande.map(s => s.substance);
}

 async addToDemande(id_demande: number, id_substance: number) {
  const demande = await this.prisma.demande.findUnique({
    where: { id_demande },
    select: { id_proc: true }
  });

  return this.prisma.substanceAssocieeDemande.create({
    data: {
      id_proc: demande?.id_proc,
      id_substance
    }
  });
}


  async removeFromDemande(id_demande: number, id_substance: number) {
    const demande = await this.prisma.demande.findUnique({
      where: { id_demande },
      select: { id_proc: true }
    });

    return this.prisma.substanceAssocieeDemande.delete({
      where: {
        id_proc_id_substance: {
          id_proc: demande?.id_proc,
          id_substance
        }
      }
    });
  }
}
