import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermisDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalPermis, activePermis, pendingDemands, expiredPermis] = await Promise.all([
      this.prisma.permis.count(),
      this.prisma.permis.count({
        where: {
          statut: {
            lib_statut: 'Actif'
          }
        }
      }),
      this.prisma.procedure.count({
        where: {
          statut_proc: 'EN_COURS'
        }
      }),
      this.prisma.permis.count({
        where: {
          date_expiration: {
            lt: new Date()
          },
          statut: {
            lib_statut: 'Actif'
          }
        }
      })
    ]);

    return {
      total: totalPermis,
      actifs: activePermis,
      enCours: pendingDemands,
      expires: expiredPermis
    };
  }

  async getPermisEvolution() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);
    
    const evolutionData = await Promise.all(
      years.map(async (year) => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        
        const count = await this.prisma.permis.count({
          where: {
            date_octroi: {
              gte: startDate,
              lt: endDate
            }
          }
        });
        
        return {
          year: year.toString(),
          value: count
        };
      })
    );

    return evolutionData;
  }

  async getPermisTypesDistribution() {
    const typeData = await this.prisma.typePermis.findMany({
      include: {
        _count: {
          select: { permis: true }
        }
      }
    });

    const colors = ['#3B82F6', '#06B6D4', '#F472B6', '#FBBF24', '#10B981', '#8B5CF6'];
    
    return typeData.map((type, index) => ({
      name: type.lib_type,
      value: type._count.permis,
      color: colors[index % colors.length]
    }));
  }
}