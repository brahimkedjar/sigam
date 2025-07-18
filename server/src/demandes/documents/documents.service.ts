import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async getDocumentsByDemande(id_demande: number) {
    // First get the complete demande with its typePermis
    const demande = await this.prisma.demande.findUnique({
      where: { id_demande },
      include: { 
        procedure: true,
        typePermis: true,
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
          take: 1
        }
      },
    });

    if (!demande?.procedure?.id_typeproc || !demande?.id_typePermis) {
      throw new Error("Données de procédure ou type de permis manquantes.");
    }

    // Get the specific dossier that matches BOTH procedure type AND permit type
    const dossier = await this.prisma.dossierAdministratif.findFirst({
      where: { 
        id_typeproc: demande.procedure.id_typeproc,
        id_typePermis: demande.id_typePermis 
      },
      include: {
        dossierDocuments: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!dossier) {
      throw new Error("Aucun dossier administratif trouvé pour cette combinaison procédure/permis.");
    }

    // Get the documents from this specific dossier
    const documents = dossier.dossierDocuments.map(dd => dd.document);

    // Get the latest dossier fournis if exists
    const latestDossierFournis = demande.dossiersFournis[0];
    const existingStatuses = latestDossierFournis?.documents || [];

    // Determine dossier status based on documents
    let dossierStatus = 'incomplet';
    if (latestDossierFournis) {
      const allPresent = documents.every(doc => 
        existingStatuses.some(s => s.id_doc === doc.id_doc && s.status === 'present')
      );
      dossierStatus = allPresent ? 'complet' : 'incomplet';
    }

    // Return documents with their status
    return {
      documents: documents.map((doc) => {
        const match = existingStatuses.find((s) => s.id_doc === doc.id_doc);
        return {
          id_doc: doc.id_doc,
          nom_doc: doc.nom_doc,
          description: doc.description,
          format: doc.format,
          taille_doc: doc.taille_doc,
          statut: match?.status || 'manquant',
          file_url: match?.file_url || null,
        };
      }),
      dossierFournis: latestDossierFournis ? {
        id_dossierFournis: latestDossierFournis.id_dossierFournis,
        statut_dossier: dossierStatus, // Use calculated status
        remarques: latestDossierFournis.remarques,
        date_depot: latestDossierFournis.date_depot
      } : null
    };
  }

  async createOrUpdateDossierFournis(
    id_demande: number,
    documents: { id_doc: number; status: string; file_url?: string }[],
    remarques?: string
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if a dossier already exists for this demande
      const existingDossier = await prisma.dossierFournis.findFirst({
        where: { id_demande },
        include: { documents: true }
      });

      // Calculate dossier status based on documents
      const allPresent = documents.every(doc => doc.status === 'present');
      const statut_dossier = allPresent ? 'complet' : 'incomplet';

      if (existingDossier) {
        // Update existing dossier
        await prisma.dossierFournisDocument.deleteMany({
          where: { id_dossierFournis: existingDossier.id_dossierFournis }
        });

        const updatedDossier = await prisma.dossierFournis.update({
          where: { id_dossierFournis: existingDossier.id_dossierFournis },
          data: {
            statut_dossier,
            remarques,
            date_depot: new Date(),
            documents: {
              createMany: {
                data: documents.map((item) => ({
                  id_doc: item.id_doc,
                  status: item.status,
                  file_url: item.file_url ?? null,
                })),
              },
            },
          },
          include: {
            documents: true
          }
        });

        return { 
          message: "Dossier fournis mis à jour avec succès",
          dossierFournis: updatedDossier 
        };
      } else {
        // Create new dossier
        const dossierFournis = await prisma.dossierFournis.create({
          data: {
            id_demande,
            statut_dossier,
            remarques,
            documents: {
              createMany: {
                data: documents.map((item) => ({
                  id_doc: item.id_doc,
                  status: item.status,
                  file_url: item.file_url ?? null,
                })),
              },
            },
          },
          include: {
            documents: true
          }
        });

        return { 
          message: "Dossier fournis créé avec succès",
          dossierFournis 
        };
      }
    });
  }

 async updateDemandeStatus(
  id_demande: number,
  statut_demande: 'ACCEPTEE' | 'REJETEE',
  motif_rejet?: string
) {
  return this.prisma.demande.update({
    where: { id_demande },
    data: {
      statut_demande,
      // Set appropriate dates and fields based on status
      ...(statut_demande === 'ACCEPTEE' && { 
        date_enregistrement: new Date(),
        motif_rejet: null // Clear rejection reason if approving
      }),
      ...(statut_demande === 'REJETEE' && { 
        date_refus: new Date(),
        motif_rejet: motif_rejet || "Raison non spécifiée"
      })
    }
  });
}
}