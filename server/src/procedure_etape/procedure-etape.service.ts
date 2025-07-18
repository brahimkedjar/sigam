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

async setStepStatus(id_proc: number, id_etape: number, statut: StatutProcedure) {
  const now = new Date();

  const existing = await this.prisma.procedureEtape.findUnique({
    where: { id_proc_id_etape: { id_proc, id_etape } },
  });

  // Close others if new step is EN_COURS
  if (statut === StatutProcedure.EN_COURS) {
    await this.prisma.procedureEtape.updateMany({
      where: { id_proc, statut: StatutProcedure.EN_COURS },
      data: { statut: StatutProcedure.TERMINEE, date_fin: now },
    });

    await this.prisma.procedureEtape.updateMany({
      where: {
        id_proc,
        id_etape: { gt: id_etape },
      },
      data: { statut: StatutProcedure.EN_ATTENTE },
    });
  }

  const updateData: Partial<ProcedureEtape> = { statut };

  if (!existing) {
    return this.prisma.procedureEtape.create({
      data: {
        id_proc,
        id_etape,
        statut,
        date_debut: statut === StatutProcedure.EN_COURS ? now : null!,
        date_fin: statut === StatutProcedure.TERMINEE ? now : null!,
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
   return this.prisma.procedureEtape.findFirst({
  where: {
    id_proc,
    statut: StatutProcedure.EN_COURS,
  },
  include: { etape: true },
});

  }
}
