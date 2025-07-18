// admin_dossier_administratif.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DossierService {
  constructor(private prisma: PrismaService) {}

  async findAllWithDetails() {
    return this.prisma.dossierAdministratif.findMany({
      include: {
        typePermis: true,
        typeProcedure: true,
        dossierDocuments: {
          include: {
            document: true
          }
        }
      }
    });
  }

  async create(data: {
    id_typeproc: number;
    id_typePermis: number;
    remarques?: string;
    documents?: {
      nom_doc: string;
      description: string;
      format: string;
      taille_doc: string;
    }[];
  }) {
    return this.prisma.$transaction(async (prisma) => {
      const dossier = await prisma.dossierAdministratif.create({
        data: {
          id_typeproc: data.id_typeproc,
          id_typePermis: data.id_typePermis,
          remarques: data.remarques,
          nombre_doc: data.documents?.length || 0
        }
      });

      if (data.documents?.length) {
        await Promise.all(data.documents.map(doc =>
          prisma.document.create({
            data: {
              ...doc,
              dossierDocuments: {
                create: {
                  id_dossier: dossier.id_dossier
                }
              }
            }
          })
        ));
      }

      return this.getDossierWithDocuments(dossier.id_dossier);
    });
  }

  async update(id: number, data: {
    remarques?: string;
    documents?: {
      id_doc?: number;
      nom_doc?: string;
      description?: string;
      format?: string;
      taille_doc?: string;
      action?: 'create' | 'update' | 'delete';
    }[];
  }) {
    return this.prisma.$transaction(async (prisma) => {
      const dossier = await prisma.dossierAdministratif.update({
        where: { id_dossier: id },
        data: { remarques: data.remarques }
      });

      if (data.documents) {
        for (const doc of data.documents) {
          if (doc.action === 'create' && doc.nom_doc) {
            await prisma.document.create({
              data: {
                nom_doc: doc.nom_doc,
                description: doc.description || '',
                format: doc.format || 'PDF',
                taille_doc: doc.taille_doc || '',
                dossierDocuments: {
                  create: {
                    id_dossier: id
                  }
                }
              }
            });
          } else if (doc.action === 'update' && doc.id_doc) {
            await prisma.document.update({
              where: { id_doc: doc.id_doc },
              data: {
                nom_doc: doc.nom_doc,
                description: doc.description,
                format: doc.format,
                taille_doc: doc.taille_doc
              }
            });
          } else if (doc.action === 'delete' && doc.id_doc) {
            await this.removeDocument(id, doc.id_doc);
          }
        }
        
        const count = await prisma.dossierDocument.count({
          where: { id_dossier: id }
        });
        
        await prisma.dossierAdministratif.update({
          where: { id_dossier: id },
          data: { nombre_doc: count }
        });
      }

      return this.getDossierWithDocuments(id);
    });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.dossierDocument.deleteMany({
        where: { id_dossier: id }
      });
      
      return prisma.dossierAdministratif.delete({
        where: { id_dossier: id }
      });
    });
  }

  async addDocument(dossierId: number, docId: number) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.dossierDocument.create({
        data: {
          id_dossier: dossierId,
          id_doc: docId
        }
      });

      const count = await prisma.dossierDocument.count({
        where: { id_dossier: dossierId }
      });

      return prisma.dossierAdministratif.update({
        where: { id_dossier: dossierId },
        data: { nombre_doc: count }
      });
    });
  }

  async removeDocument(dossierId: number, docId: number) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.dossierDocument.deleteMany({
        where: {
          id_dossier: dossierId,
          id_doc: docId
        }
      });

      const count = await prisma.dossierDocument.count({
        where: { id_dossier: dossierId }
      });

      return prisma.dossierAdministratif.update({
        where: { id_dossier: dossierId },
        data: { nombre_doc: count }
      });
    });
  }

  private async getDossierWithDocuments(id: number) {
    return this.prisma.dossierAdministratif.findUnique({
      where: { id_dossier: id },
      include: {
        typePermis: true,
        typeProcedure: true,
        dossierDocuments: {
          include: {
            document: true
          }
        }
      }
    });
  }
}