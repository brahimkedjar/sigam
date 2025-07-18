import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('api')
export class DemandeSummaryController {
  constructor(private prisma: PrismaService) {}


  @Get('summary/by-proc/:idProc')
async getFullDemandeSummaryByProc(@Param('idProc', ParseIntPipe) idProc: number) {
  const demande = await this.prisma.demande.findFirst({
    where: { id_proc: idProc },
    include: {
      procedure: {
        include: {
          typeProcedure: {
            include: {
              DossierAdministratif: {
                include: {
                  dossierDocuments: {
                    include: {
                      document: true,
                    },
                  },
                  typePermis: true,
                },
              },
            },
          },
          SubstanceAssocieeDemande: {
            include: { substance: true },
          },
        },
      },
      typePermis: true,
      detenteur: {
        include: {
          registreCommerce: true,
          fonctions: {
            include: {
              personne: true,
            },
          },
        },
      },
      wilaya: true,
      daira: true,
      commune: true,
      dossiersFournis: {
        include: {
          documents: {
            include: {
              document: true,
            },
          },
        },
        orderBy: {
          date_depot: 'desc',
        },
        take: 1,
      },
      expertMinier: true,
    },
  });

  if (!demande) {
    throw new NotFoundException('Demande introuvable pour cette procédure');
  }

  return demande;
}

  @Get('demande/:idDemande/summary')
  async getFullDemandeSummary(@Param('idDemande', ParseIntPipe) id: number) {
  return this.prisma.demande.findUnique({
    where: { id_demande: id },
    include: {
      procedure: {
        include: {
          typeProcedure: {
            include: {
              DossierAdministratif: {
                include: {
                  dossierDocuments: {
                    include: {
                      document: true
                    }
                  },
                  typePermis: true
                }
              }
            }
          },
          SubstanceAssocieeDemande: {
            include: { substance: true }
          }
        }
      },
      typePermis: true,
      detenteur: {
        include: {
          registreCommerce: true,
          fonctions: {
            include: {
              personne: true
            }
          }
        }
      },
      wilaya: true,
      daira: true,
      commune: true,
      dossiersFournis: {
        include: {
          documents: {
            include: {
              document: true
            }
          }
        },
        orderBy: {
          date_depot: 'desc'
        },
        take: 1 // Get only the latest dossier
      },
      expertMinier: true
    }
  });
}
}