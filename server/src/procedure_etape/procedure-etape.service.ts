// src/procedure-etape/procedure-etape.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcedureEtape, StatutProcedure } from '@prisma/client';

@Injectable()
export class ProcedureEtapeService {
  constructor(private prisma: PrismaService) {}

 async setCurrentEtape(id_proc: number, id_etape: number, terminate = false) {
  // Terminer les autres étapes en cours
  await this.prisma.procedureEtape.updateMany({
  where: { id_proc, statut: StatutProcedure.EN_COURS },
  data: { statut: StatutProcedure.TERMINEE, date_fin: new Date() },
});

  const exists = await this.prisma.procedureEtape.findUnique({
    where: { id_proc_id_etape: { id_proc, id_etape } },
  });

 const data = {
  statut: terminate ? StatutProcedure.TERMINEE : StatutProcedure.EN_COURS,
  date_debut: new Date(),
  date_fin: terminate ? new Date() : null,
};

  if (exists) {
    return this.prisma.procedureEtape.update({
      where: { id_proc_id_etape: { id_proc, id_etape } },
      data,
    });
  } else {
    return this.prisma.procedureEtape.create({
      data: {
        id_proc,
        id_etape,
        ...data,
      },
    });
  }
}

async setStepStatus(id_proc: number, id_etape: number, statut: StatutProcedure , link?: string) {
  const now = new Date();

  const existing = await this.prisma.procedureEtape.findUnique({
    where: { id_proc_id_etape: { id_proc, id_etape } },
  });

  // Close others if new step is EN_COURS
  if (statut === StatutProcedure.EN_COURS) {
  // Don't update if this step is already EN_COURS
  if (existing && existing.statut === StatutProcedure.EN_COURS) {
    return existing;
  }

  // Close other active steps (but not this one)
  await this.prisma.procedureEtape.updateMany({
    where: {
      id_proc,
      id_etape: { not: id_etape },
      statut: StatutProcedure.EN_COURS,
    },
    data: { statut: StatutProcedure.TERMINEE, date_fin: now },
  });

  // Set future steps to EN_ATTENTE
  await this.prisma.procedureEtape.updateMany({
    where: {
      id_proc,
      id_etape: { gt: id_etape },
    },
    data: { statut: StatutProcedure.EN_ATTENTE },
  });
}


  const updateData: Partial<ProcedureEtape> = { statut };
  if (link) updateData.link = link;

  if (!existing) {
    return this.prisma.procedureEtape.create({
      data: {
        id_proc,
        id_etape,
        statut,
        date_debut: statut === StatutProcedure.EN_COURS ? now : null!,
        date_fin: statut === StatutProcedure.TERMINEE ? now : null!,
        link
      },
    });
  }

  if (statut === StatutProcedure.EN_COURS && !existing.date_debut) {
    updateData.date_debut = now;
  }

  if (statut === StatutProcedure.TERMINEE && !existing.date_fin) {
    updateData.date_fin = now;
  }

  return this.prisma.procedureEtape.update({
    where: { id_proc_id_etape: { id_proc, id_etape } },
    data: updateData,
  });
}




  async getCurrentEtape(id_proc: number) {
  // Try to get the step in progress
  const enCours = await this.prisma.procedureEtape.findFirst({
    where: {
      id_proc,
      statut: StatutProcedure.EN_COURS,
    },
    include: { etape: true },
  });

  if (enCours) return enCours;

  // If none in progress, get the most recent
  const lastSaved = await this.prisma.procedureEtape.findFirst({
    where: {
      id_proc,
    },
    orderBy: {
      date_debut: 'desc', // latest first
    },
    include: { etape: true },
  });

  return lastSaved;
}


}
