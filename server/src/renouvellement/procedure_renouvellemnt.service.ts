import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRenewalDto } from './create-renouvellement.dto';
import { PaymentService } from 'src/demandes/paiement/payment.service';

@Injectable()
export class ProcedureRenouvellementService {
  constructor(private readonly prisma: PrismaService,private paymentService: PaymentService) {}

  async startRenewalWithOriginalData(permisId: number, date_demande: string) {
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
            libelle: { not: 'renouvellement' }
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
      type_permis_demande: permis.typePermis?.code_type,
      statut_demande: 'EN_COURS',
      date_demande: parsedDate,
    }
  });

  await this.prisma.procedureRenouvellement.create({
    data: {
      id_proc: newProcedure.id_proc,
      nombre_renouvellement: await this.countPreviousRenewals(permisId)
    }
  });

  const etapes = await this.prisma.etapeProc.findMany();
  await this.prisma.procedureEtape.createMany({
    data: etapes.map(e => ({
      id_proc: newProcedure.id_proc,
      id_etape: e.id_etape,
      statut: 'EN_ATTENTE',
      date_debut: new Date()
    }))
  });

  return {
    original_demande_id: initialDemande?.id_demande,
    original_proc_id: initialProcedure?.id_proc,
    new_proc_id: newProcedure.id_proc
  };
}




  private async countPreviousRenewals(permisId: number): Promise<number> {
    const count = await this.prisma.procedureRenouvellement.count({
      where: {
        procedure: {
          permis: {
            some: { id: permisId }
          }
        }
      }
    });

    return count + 1;
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
