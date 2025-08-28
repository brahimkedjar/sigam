import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermisDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalPermis, activePermis, pendingDemands, expiredPermis] = await Promise.all([
      this.prisma.permis.count(),
      this.prisma.permis.count({
        where: {
          statut: {
            lib_statut: 'En vigueur'
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
            lib_statut: 'En vigueur'
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

  // Add this new method for status distribution
  async getPermisStatusDistribution() {
    // Get all statuses with their counts
    const statusData = await this.prisma.statutPermis.findMany({
      include: {
        _count: {
          select: { Permis: true }
        }
      }
    });

    // Define colors for different statuses
    const statusColors: Record<string, string> = {
      'Actif': '#10B981',      // Green
      'Expiré': '#EF4444',     // Red
      'En attente': '#F59E0B', // Amber
      'Suspendu': '#8B5CF6',   // Violet
      'Révoqué': '#64748B',    // Gray
      'default': '#3B82F6'     // Blue (default)
    };

    return statusData.map(status => ({
      name: status.lib_statut,
      value: status._count.Permis,
      color: statusColors[status.lib_statut] || statusColors.default
    }));
  }

  // Alternative method if you want to include expiration-based status
  async getPermisStatusDistributionWithExpiration() {
    // Get status-based counts
    const statusData = await this.prisma.statutPermis.findMany({
      include: {
        _count: {
          select: { Permis: true }
        }
      }
    });

    // Get count of expired permits regardless of their status
    const expiredCount = await this.prisma.permis.count({
      where: {
        date_expiration: {
          lt: new Date()
        }
      }
    });

    // Define colors for different statuses
    const statusColors: Record<string, string> = {
      'En vigueur': '#10B981',      // Green
      'Expiré': '#EF4444',     // Red
      'En attente': '#F59E0B', // Amber
      'Suspendu': '#8B5CF6',   // Violet
      'Révoqué': '#64748B',    // Gray
      'default': '#3B82F6'     // Blue (default)
    };

    const result = statusData.map(status => ({
      name: status.lib_statut,
      value: status._count.Permis,
      color: statusColors[status.lib_statut] || statusColors.default
    }));

    // Add expired count as a separate category if needed
    // Note: This might double-count permits that are marked as expired in both status and date
    result.push({
      name: 'Expiré (par date)',
      value: expiredCount,
      color: '#EF4444'
    });

    return result;
  }
}