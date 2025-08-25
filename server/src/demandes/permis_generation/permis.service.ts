import { Injectable } from '@nestjs/common';
import { unescape } from 'querystring';
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

  if (
    !demande ||
    !demande.typePermis ||
    !demande.procedure ||
    !demande.detenteur ||
    !demande.wilaya
  ) {
    throw new Error("Missing data for permit generation");
  }

  // ✅ Récupérer l’antenne de la wilaya
  const antenneId = demande.wilaya?.id_antenne ?? null;

  const expirationDate = new Date();
  expirationDate.setFullYear(
    expirationDate.getFullYear() + demande.typePermis.duree_initiale
  );

  const newPermis = await this.prisma.permis.create({
    data: {
      id_typePermis: demande.typePermis.id,
      id_antenne: antenneId, 
      id_detenteur: demande.detenteur.id_detenteur,
      id_statut: 1,
      code_permis: demande.code_demande,
      date_adjudication: null,
      date_octroi: new Date(),
      date_expiration: expirationDate,
      duree_validite: demande.typePermis.duree_initiale,
      lieu_dit: demande.lieu_dit || "",
      mode_attribution: demande.objet_demande || "",
      superficie: demande.superficie || 0,
      utilisation: "",
      statut_juridique_terrain: demande.statut_juridique_terrain || "",
      duree_prevue_travaux: demande.duree_travaux_estimee || null,
      date_demarrage_travaux: demande.date_demarrage_prevue || null,
      statut_activites: demande.procedure.statut_proc || "",
      commentaires: null,
      nombre_renouvellements: 0,
    },
  });

  await this.prisma.cahierCharge.updateMany({
    where: { demandeId: demandeId },
    data: { permisId: newPermis.id },
  });

  await this.prisma.procedure.update({
    where: { id_proc: demande.id_proc },
    data: { permis: { connect: { id: newPermis.id } } },
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

async getTemplates(codepermis?: string) {
  // First find the permis by its code
  const permis = await this.prisma.permis.findUnique({
    where: { code_permis: codepermis },
  });

  if (!permis) {
    return []; // Return empty array if no permis found
  }

  // Then find all templates associated with this permis
  return this.prisma.permisTemplate.findMany({
    where: { 
      permisId: permis.id 
    },
    orderBy: { 
      createdAt: 'desc' 
    }
  });
}
  async saveTemplate(templateData: any) {
  const { elements, permisId, templateId, name } = templateData;
  
  const parsedPermisId = permisId ? parseInt(permisId, 10) : undefined;
  if (parsedPermisId && isNaN(parsedPermisId)) {
    throw new Error('Invalid permisId');
  }

  // Get the permis to determine typePermisId
  const permis = await this.prisma.permis.findUnique({
    where: { id: parsedPermisId },
    select: { typePermis: true }
  });

  if (!permis && parsedPermisId) {
    throw new Error('Permis not found');
  }

  // Ensure elements is properly formatted
  if (!elements) {
    throw new Error('Elements data is required');
  }

  if (templateId) {
    // Update existing template
    return this.prisma.permisTemplate.update({
      where: { id: templateId },
      data: { 
        elements,
        name: name || undefined, // Update name if provided
        updatedAt: new Date(),
        version: { increment: 1 }
      }
    });
  } else {
    // Create new template
    return this.prisma.permisTemplate.create({
      data: {
        name: name || `Template ${new Date().toLocaleDateString()}`,
        elements: elements,
        typePermisId: permis?.typePermis.id || 1,
        permisId: parsedPermisId
      }
    });
  }
}

async deleteTemplate(id: string) {
  return this.prisma.permisTemplate.delete({
    where: { id: parseInt(id) }
  });
}

}