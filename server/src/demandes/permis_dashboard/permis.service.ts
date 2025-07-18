import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class Permisdashboard2Service {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permis.findMany({
      include: {
        typePermis: true,
        detenteur: true,
        statut: true
      },
      orderBy: {
        date_octroi: 'desc'
      }
    });
  }

  async findActive() {
    return this.prisma.permis.findMany({
      where: {
        statut: {
          lib_statut: 'Actif'
        }
      },
      include: {
        typePermis: true,
        detenteur: true,
        statut: true
      },
      orderBy: {
        date_octroi: 'desc'
      }
    });
  }

  async findExpired() {
    return this.prisma.permis.findMany({
      where: {
        date_expiration: {
          lt: new Date()
        },
        statut: {
          lib_statut: 'Actif'
        }
      },
      include: {
        typePermis: true,
        detenteur: true,
        statut: true
      },
      orderBy: {
        date_expiration: 'desc'
      }
    });
  }

async findAll1(pagination: { skip?: number; take?: number } = {}) {
    return this.prisma.permis.findMany({
      include: {
        typePermis: true,
        detenteur: true,
        statut: true,
        procedures: {
          include: {
            SubstanceAssocieeDemande: {
              include: {
                substance: true
              }
            }
          }
        }
      },
      orderBy: {
        date_octroi: 'desc'
      },
      skip: pagination.skip,
      take: pagination.take
    });
  }

  async findCurrent(pagination: { skip?: number; take?: number } = {}) {
    return this.prisma.permis.findMany({
      where: {
        statut: {
          lib_statut: 'Actif'
        }
      },
      include: {
        typePermis: true,
        detenteur: true,
        statut: true,
        procedures: {
          include: {
            SubstanceAssocieeDemande: {
              include: {
                substance: true
              }
            }
          }
        }
      },
      orderBy: {
        date_octroi: 'desc'
      },
      skip: pagination.skip,
      take: pagination.take
    });
  }

  async findOneWithDetails(permisId: number) {
  return this.prisma.permis.findUnique({
    where: { id: permisId },
    include: {
      typePermis: true,
      detenteur: true,
      statut: true,
      procedures: {
        include: {
          typeProcedure: true,
          SubstanceAssocieeDemande: {
            include: {
              substance: true
            }
          },
          ProcedureEtape: {
            include: {
              etape: true
            },
            orderBy: {
              etape: {
                ordre_etape: 'asc'
              }
            }
          },
          demandes: {
            include: {
              detenteur: true
            }
          }
        }
      }
    }
  });
}

async delete(id: number) {
  return this.prisma.permis.delete({
    where: { id }
  });
}
}
