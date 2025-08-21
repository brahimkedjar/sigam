import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CapacitesService {
  constructor(private prisma: PrismaService) {}

 async saveCapacites(data: any) {
  const id_demande = parseInt(data.id_demande);

  // Update the Demande with capacities and selected expert
  return this.prisma.demande.update({
    where: { id_demande },
    data: {
      duree_travaux_estimee: parseInt(data.duree_travaux),
      capital_social_disponible: parseFloat(data.capital_social),
      budget_prevu: parseFloat(data.budget),
      description_travaux: data.description,
      sources_financement: data.financement,
      date_demarrage_prevue: new Date(data.date_demarrage_prevue),
      id_expert: data.id_expert, 
    },
  });
}

}
