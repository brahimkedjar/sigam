import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CapacitesService {
  constructor(private prisma: PrismaService) {}

 async saveCapacites(data: any) {
  const id_demande = parseInt(data.id_demande);

  // 🔁 Update the demande
  await this.prisma.demande.update({
    where: { id_demande },
    data: {
      duree_travaux_estimee: parseInt(data.duree_travaux),
      capital_social_disponible: parseFloat(data.capital_social),
      budget_prevu: parseFloat(data.budget),
      description_travaux: data.description,
      sources_financement: data.financement,
      date_demarrage_prevue: new Date(data.date_demarrage_prevue),
    }
  });

  // ✅ Insert expertMinier
  const expert = await this.prisma.expertMinier.create({
    data: {
      nom_expert: data.nom_expert,
      fonction: data.fonction,
      num_registre: data.num_registre,
      organisme: data.organisme
    }
  });

  // ✅ Mise à jour de l'ID de l'expert dans la demande
  await this.prisma.demande.update({
    where: { id_demande },
    data: {
      id_expert: expert.id_expert
    }
  });

  return { message: 'Capacités mises à jour avec succès.' };
}
}
