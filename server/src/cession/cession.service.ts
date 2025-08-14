import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaymentService } from 'src/demandes/paiement/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatutProcedure } from '@prisma/client';

@Injectable()
export class CessionService {
    
  constructor(private readonly prisma: PrismaService,private paymentService: PaymentService) {}

    async startCessionWithOriginalData(  permisId: number,  date_demande: string, statut: StatutProcedure) {
  if (!date_demande || isNaN(Date.parse(date_demande))) {
    throw new BadRequestException('La date de la demande est invalide.');
  }

  // 1. Récupérer le permis et sa procédure initiale
  const permis = await this.prisma.permis.findUnique({
    where: { id: permisId },
    include: {
      typePermis: true,
      procedures: {
        where: {
          typeProcedure: { libelle: 'demande' }
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

  // 2. Récupérer le type de procédure "cession"
  const typeProc = await this.prisma.typeProcedure.findFirst({
    where: { libelle: { contains: 'cession', mode: 'insensitive' } }
  });

  if (!typeProc) {
    throw new NotFoundException('Type de procédure "cession" non trouvé.');
  }

  // 3. Créer la nouvelle procédure
  const newProcedure = await this.prisma.procedure.create({
    data: {
      id_typeproc: typeProc.id,
      num_proc: `PROC-C-${Date.now()}`,
      date_debut_proc: new Date(),
      statut_proc: statut,
      permis: { connect: { id: permis.id } }
    }
  });

  // 4. Créer la demande liée à la cession
  const parsedDate = new Date(date_demande);
  const newDemande = await this.prisma.demande.create({
    data: {
      id_proc: newProcedure.id_proc,
      id_typePermis: permis.id_typePermis,
      code_demande: `DEM-C-${Date.now()}`,
      statut_demande: 'EN_COURS',
      date_demande: parsedDate
    }
  });

  // 5. Créer l’enregistrement spécifique à la cession
  await this.prisma.procedureCession.create({
    data: {
      id_proc: newProcedure.id_proc
      // tu peux rajouter ici des champs spécifiques à la cession
    }
  });

  return {
    original_demande_id: initialDemande?.id_demande,
    original_proc_id: initialProcedure?.id_proc,
    new_proc_id: newProcedure.id_proc
  };
}

 // Liste de tous les permis avec relations
  async getPermis() {
    return this.prisma.permis.findMany({
      include: {
        typePermis: true,
        detenteur: true,
        statut: true,
        // Inclure wilaya via la relation Demande ou autre si nécessaire
      },
    });
  }

  // Liste de toutes les wilayas
  async getWilayas() {
    return this.prisma.wilaya.findMany({
      select: {
        id_wilaya: true,
        nom_wilaya: true,
      },
      orderBy: { nom_wilaya: 'asc' },
    });
  }

  // Liste de tous les types de permis
  async getTypesPermis() {
    return this.prisma.typePermis.findMany({
      select: {
        id: true,
        lib_type: true,
      },
      orderBy: { lib_type: 'asc' },
    });

  }

}
