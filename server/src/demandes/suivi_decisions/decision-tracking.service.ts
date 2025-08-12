// decision-tracking/decision-tracking.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DecisionTrackingService {
  constructor(private prisma: PrismaService) {}

  async getDecisionTrackingData() {
    return this.prisma.procedure.findMany({
      where: {
        id_seance: { not: null },
      },
      include: {
        typeProcedure: true,
        demandes: {
          include: {
            detenteur: true,
          },
        },
        seance: {
          include: {
            comites: {
              include: {
                decisionCDs: true,
              },
            },
          },
        },
      },
      orderBy: {
        date_debut_proc: 'desc',
      },
    });
  }

  async getDecisionStats() {
    const total = await this.prisma.procedure.count({
      where: { id_seance: { not: null } },
    });

    const approved = await this.prisma.procedure.count({
      where: {
        id_seance: { not: null },
        seance: {
          comites: {
            some: {
              decisionCDs: {
                some: { decision_cd: 'favorable' },
              },
            },
          },
        },
      },
    });

    const rejected = await this.prisma.procedure.count({
      where: {
        id_seance: { not: null },
        seance: {
          comites: {
            some: {
              decisionCDs: {
                some: { decision_cd: 'defavorable' },
              },
            },
          },
        },
      },
    });

    return { total, approved, rejected };
  }

  async getProcedureDetails(id: number) {
    return this.prisma.procedure.findUnique({
      where: { id_proc: id },
      include: {
        typeProcedure: true,
        demandes: {
          include: {
            detenteur: true,
            typePermis: true,
          },
        },
        seance: {
          include: {
            comites: {
              include: {
                decisionCDs: true,
              },
            },
          },
        },
        permis: {
          include: {
            detenteur: true,
          },
        },
      },
    });
  }
}