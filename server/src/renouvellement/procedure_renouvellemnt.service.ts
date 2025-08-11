import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRenewalDto } from './create-renouvellement.dto';
import { PaymentService } from 'src/demandes/paiement/payment.service';
import { StatutProcedure } from '@prisma/client';
import { ProcedureEtapeService } from '../procedure_etape/procedure-etape.service';
import { StatutPermis } from './types';
@Injectable()
export class ProcedureRenouvellementService {
  constructor(private readonly prisma: PrismaService,private paymentService: PaymentService , private readonly procedureEtapeService: ProcedureEtapeService,) {}

  async startRenewalWithOriginalData(permisId: number, date_demande: string , statut: StatutProcedure) {
      const now = new Date();

  if (!date_demande || isNaN(Date.parse(date_demande))) {
    throw new BadRequestException('La date de la demande est invalide.');
  }

  const permis = await this.prisma.permis.findUnique({
    where: { id: permisId },
    include: {
      typePermis: true,
      procedures: {
        where: {
          typeProcedure: {
            libelle: 'demande'
          }
        },
        include: { demandes: true },
        orderBy: { date_debut_proc: 'asc' }
      }
    }
  });

  if (!permis || permis.procedures.length === 0) {
    throw new NotFoundException('Aucune procédure initiale trouvée pour ce permis.');
  }

  const initialProcedure = permis.procedures[0];
  const initialDemande = initialProcedure.demandes[0];

  const typeProc = await this.prisma.typeProcedure.findFirst({
    where: { libelle: { contains: 'renouvellement', mode: 'insensitive' } }
  });

  const newProcedure = await this.prisma.procedure.create({
    data: {
      id_typeproc: typeProc!.id,
      num_proc: `PROC-R-${Date.now()}`,
      date_debut_proc: new Date(),
      statut_proc: 'EN_COURS',
      permis: { connect: { id: permis.id } }
    }
  });

  const parsedDate = new Date(date_demande);
  const newDemande = await this.prisma.demande.create({
    data: {
      id_proc: newProcedure.id_proc,
      id_typePermis: permis.id_typePermis,
      code_demande: `DEM-R-${Date.now()}`,
      statut_demande: 'EN_COURS',
      date_demande: parsedDate,
    }
  });

  await this.prisma.procedureRenouvellement.create({
    data: {
      id_proc: newProcedure.id_proc,
    }
  });





  return {
    original_demande_id: initialDemande?.id_demande,
    original_proc_id: initialProcedure?.id_proc,
    new_proc_id: newProcedure.id_proc
  };
}

async getPermisForProcedure(procedureId: number) {
  const procedure = await this.prisma.procedure.findUnique({
    where: { id_proc: procedureId },
    include: {
      permis: {
        include: {
          typePermis: true,
          statut: true
        }
      }
    }
  });
  return procedure?.permis[0] || null;
}

async createOrUpdateRenewal(procedureId: number, renewalData: any) {
  const procedure = await this.prisma.procedure.findUnique({
    where: { id_proc: procedureId },
    include: {
      permis: {
        include: {
          typePermis: true
        }
      }
    }
  });

  if (!procedure) throw new NotFoundException('Procedure not found');
  
  const permit = procedure.permis[0];
  if (!permit) throw new NotFoundException('Permit not found');
  
  const permitType = permit.typePermis;
  if (!permitType) throw new NotFoundException('Permit type not found');

  // Get current renewal count from permit
  const currentRenewalCount = permit.nombre_renouvellements;

  // Validate against max renewals
  if (currentRenewalCount >= permitType.nbr_renouv_max) {
    throw new BadRequestException(
      `Maximum renewals (${permitType.nbr_renouv_max}) reached`
    );
  }

  // Calculate dates
  const startDate = new Date(renewalData.date_debut_validite);
  const endDate = new Date(renewalData.date_fin_validite);

  // Update the permit's expiration date and increment renewal count
  await this.prisma.permis.update({
    where: { id: permit.id },
    data: {
      date_expiration: endDate,
      nombre_renouvellements: currentRenewalCount + 1
    }
  });

  // Create/update the renewal record
  const updatedRenewal = await this.prisma.procedureRenouvellement.upsert({
    where: { id_proc: procedureId },
    update: {
      num_decision: renewalData.num_decision,
      date_decision: new Date(renewalData.date_decision),
      date_debut_validite: startDate,
      date_fin_validite: endDate,
      commentaire: renewalData.commentaire
    },
    create: {
      id_proc: procedureId,
      num_decision: renewalData.num_decision,
      date_decision: new Date(renewalData.date_decision),
      date_debut_validite: startDate,
      date_fin_validite: endDate,
      commentaire: renewalData.commentaire
    }
  });

  return updatedRenewal;
}

// procedure_renouvellement.service.ts

async getPermitTypeDetails(permitTypeId: number) {
  const permitType = await this.prisma.typePermis.findUnique({
    where: { id: permitTypeId }
  });

  if (!permitType) {
    throw new NotFoundException('Permit type not found');
  }

  return {
    duree_renouv: permitType.duree_renouv,
    nbr_renouv_max: permitType.nbr_renouv_max
  };
}

  // In your service
async getPermisRenewals(permisId: number) {
  return this.prisma.procedure.findMany({
    where: {
      permis: { some: { id: permisId } }, // Procedures linked to this permit
      typeProcedure: { libelle: 'renouvellement' }, // Only renewal procedures
      renouvellement: { isNot: null }, // Must have a linked renewal
    },
    include: {
      renouvellement: true, // Include the renewal data
    },
    orderBy: { date_debut_proc: 'desc' },
  });
}

  async updatePermisStatus(procedureId: number, status: string) {
  // Convert status to uppercase to match enum
  const normalizedStatus = status.toUpperCase();
  
  // Validate status against the enum
  if (!Object.values(StatutPermis).includes(normalizedStatus as StatutPermis)) {
    throw new BadRequestException(
      `Invalid status: ${status}. Valid values are: ${Object.values(StatutPermis).join(', ')}`
    );
  }

  // Find the permit associated with this procedure
  const permit = await this.prisma.permis.findFirst({
    where: { procedures: { some: { id_proc: procedureId } } },
    include: { statut: true }
  });

  if (!permit) {
    throw new NotFoundException('Permis not found for this procedure');
  }

  try {
    // Find or create status (using normalized value)
    const statut = await this.prisma.statutPermis.upsert({
      where: { lib_statut: normalizedStatus },
      create: { 
        lib_statut: normalizedStatus,
        description: `Status ${normalizedStatus}`
      },
      update: {} // No updates needed if exists
    });

    // Update the permit's status
    return this.prisma.permis.update({
      where: { id: permit.id },
      data: {
        id_statut: statut.id
      },
      include: {
        statut: true,
        procedures: true
      }
    });
  } catch (error) {
    console.error('Error updating permit status:', error);
    throw new InternalServerErrorException('Failed to update permit status');
  }
}
  // In your service
async getRenewalData(procedureId: number) {
  const renewal = await this.prisma.procedureRenouvellement.findUnique({
    where: { id_proc: procedureId },
    include: {
      procedure: {
        include: {
          permis: {
            include: {
              typePermis: true,
              detenteur: true,
              statut: true
            }
          }
        }
      }
    }
  });

  if (!renewal) {
    throw new NotFoundException('Renewal data not found');
  }

  return {
    num_decision: renewal.num_decision,
    date_decision: renewal.date_decision?.toISOString().split('T')[0],
    date_debut_validite: renewal.date_debut_validite?.toISOString().split('T')[0],
    date_fin_validite: renewal.date_fin_validite?.toISOString().split('T')[0],
    commentaire: renewal.commentaire,
    duree_renouvellement: renewal.duree_renouvellement,
    permis: renewal.procedure.permis[0],
    nombre_renouvellements: renewal.procedure.permis[0].nombre_renouvellements,
  };
}

  private async countPreviousRenewals(permisId: number): Promise<number> {
  const permit = await this.prisma.permis.findUnique({
    where: { id: permisId }
  });
  
  if (!permit) throw new NotFoundException('Permit not found');
  
  return permit.nombre_renouvellements;
}

  async getProcedureWithType(id: number) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id_proc: id },
      include: {
        typeProcedure: true,
      },
    });

    if (!procedure) {
      throw new NotFoundException('Procédure non trouvée');
    }
    return procedure;
  }
}
