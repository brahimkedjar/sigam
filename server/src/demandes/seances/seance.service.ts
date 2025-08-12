// seances/seance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeanceDto } from './create-seance.dto';

@Injectable()
export class SeanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.seanceCDPrevue.findMany({
      include: {
        membres: {
          select: {
            id_membre: true,
            nom_membre: true,
            prenom_membre: true,
          },
        },
        procedures: {
          select: {
            id_proc: true,
            num_proc: true,
          },
        },
      },
      orderBy: {
        date_seance: 'desc',
      },
    });
  }

  async getNextSeanceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastSeance = await this.prisma.seanceCDPrevue.findFirst({
      where: {
        num_seance: {
          contains: `CD-${currentYear}`,
        },
      },
      orderBy: {
        num_seance: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastSeance) {
      const matches = lastSeance.num_seance.match(/CD-(\d{4})-(\d+)/);
      if (matches && matches[2]) {
        nextNumber = parseInt(matches[2], 10) + 1;
      }
    }

    return `CD-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // seances/seance.service.ts
async create(createSeanceDto: CreateSeanceDto) {
  const { membresIds, proceduresIds, ...seanceData } = createSeanceDto;

  // Set default value for exercice if not provided
  const exercice = createSeanceDto.exercice || new Date().getFullYear();

  return this.prisma.seanceCDPrevue.create({
    data: {
      ...seanceData,
      exercice, 
      membres: {
        connect: membresIds.map(id => ({ id_membre: id })),
      },
      procedures: {
        connect: proceduresIds.map(id => ({ id_proc: id })),
      },
    },
    include: {
      membres: true,
      procedures: true,
    },
  });
}

async findAllmembers() {
    return this.prisma.membresComite.findMany({
      orderBy: {
        nom_membre: 'asc',
      },
    });
  }

// seance.service.ts
async getAllProcedures(search?: string, page = 1, pageSize = 20) {
  const where: any = {};
  
  if (search) {
    where.OR = [
      { num_proc: { contains: search, mode: 'insensitive' } },
      { 
        demandes: {
          some: {
            detenteur: {
              nom_sociétéFR: { contains: search, mode: 'insensitive' }
            }
          }
        }
      },
      {
        typeProcedure: {
          libelle: { contains: search, mode: 'insensitive' }
        }
      }
    ];
  }

  return this.prisma.procedure.findMany({
    where,
    include: {
      typeProcedure: {
        select: { libelle: true }
      },
      demandes: {
        select: {
          detenteur: {
            select: { nom_sociétéFR: true }
          }
        },
        take: 1 // Only get the first demande for detenteur
      }
    },
    orderBy: { date_debut_proc: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });
}

async update(id: number, updateSeanceDto: CreateSeanceDto) {
    const { membresIds, proceduresIds, ...seanceData } = updateSeanceDto;

    return this.prisma.seanceCDPrevue.update({
      where: { id_seance: id },
      data: {
        ...seanceData,
        membres: {
          set: membresIds.map(id => ({ id_membre: id })),
        },
        procedures: {
          set: proceduresIds.map(id => ({ id_proc: id })),
        },
      },
      include: {
        membres: true,
        procedures: true,
      },
    });
  }

  async remove(id: number) {
    // First disconnect all relations
    await this.prisma.seanceCDPrevue.update({
      where: { id_seance: id },
      data: {
        membres: {
          set: [],
        },
        procedures: {
          set: [],
        },
        comites: {
          set: [],
        }
      }
    });

    // Then delete the seance
    return this.prisma.seanceCDPrevue.delete({
      where: { id_seance: id },
    });
  }

async getSeancesForMember(memberId: number) {
  return this.prisma.seanceCDPrevue.findMany({
    where: {
      membres: {
        some: {
          id_membre: memberId
        }
      }
    },
    include: {
      membres: {
        select: {
          id_membre: true,
          nom_membre: true,
          prenom_membre: true
        }
      },
      procedures: {
        select: {
          id_proc: true,
          num_proc: true,
          demandes: {
            select: {
              detenteur: {
                select: {
                  nom_sociétéFR: true
                }
              }
            }
          },
          typeProcedure: {
            select: {
              libelle: true
            }
          }
        }
      }
    },
    orderBy: {
      date_seance: 'asc'
    }
  });
}

async getSeancesWithDecisions() {
  return this.prisma.seanceCDPrevue.findMany({
    include: {
      comites: {
        include: {
          decisionCDs: true
        }
      },
      procedures: {
        include: {
          typeProcedure: true,
          demandes: {
            include: {
              detenteur: true
            }
          }
        }
      },
      membres: {
        select: {
          id_membre: true,
          nom_membre: true,
          prenom_membre: true
        }
      }
    },
    orderBy: {
      date_seance: 'desc'
    }
  });
}

}