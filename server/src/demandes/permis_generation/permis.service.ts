import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeneratePermisService {
  constructor(private prisma: PrismaService) {}

  async generatePermisFromDemande(demandeId: number) {
  const demande = await this.prisma.demande.findUnique({
    where: { id_demande: demandeId },
    include: {
      typePermis: true,
      wilaya: { include: { antenne: true } },
      daira: true,
      commune: true,
      procedure: true,
      detenteur: true
    }
  });

  if (!demande || !demande.typePermis || !demande.procedure || !demande.detenteur || !demande.wilaya) {
    throw new Error('Missing data for permit generation');
  }

  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + demande.typePermis.duree_initiale);

  const newPermis = await this.prisma.permis.create({
    data: {
      id_typePermis: demande.typePermis.id,
      id_antenne: null,
      id_detenteur: demande.detenteur.id_detenteur,
      id_statut: 1,
      code_permis: demande.code_demande,
      date_adjudication: null,
      date_octroi: new Date(),
      date_expiration: expirationDate,
      duree_validite: demande.typePermis.duree_initiale,
      lieu_dit: demande.lieu_dit || '',
      mode_attribution: demande.objet_demande || '',
      superficie: demande.superficie || 0,
      utilisation: '',
      statut_juridique_terrain: demande.statut_juridique_terrain || '',
      duree_prevue_travaux: demande.duree_travaux_estimee || null,
      date_demarrage_travaux: demande.date_demarrage_prevue || null,
      statut_activites: demande.procedure.statut_proc || '',
      commentaires: null,
      nombre_renouvellements:0,
    }
  });

  // ✅ Update CahierCharge with the new permisId
  await this.prisma.cahierCharge.updateMany({
    where: { demandeId: demandeId },
    data: {
      permisId: newPermis.id,
    },
  });

  // ✅ Link the new Permis to the Procedure
  await this.prisma.procedure.update({
    where: { id_proc: demande.id_proc },
    data: {
      permis: {
        connect: {
          id: newPermis.id
        }
      }
    }
  });

  return newPermis;
}


  async getPermisPdfInfo(demandeId: number) {
    return this.prisma.demande.findUnique({
      where: { id_demande: demandeId },
      include: {
        typePermis: true,
        wilaya: true,
        daira: true,
        commune: true,
        detenteur: true,
        procedure: true
      }
    });
  }
}