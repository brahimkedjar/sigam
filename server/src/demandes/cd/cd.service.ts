// cd.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSeanceDto, UpdateSeanceDto } from '../dto/cd.dto';
import { CreateComiteDto, UpdateComiteDto } from '../dto/cd.dto';
import { CreateDecisionDto } from '../dto/cd.dto';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class CdService {
  constructor(private prisma: PrismaService) {}

    async updateSeance(id: number, data: UpdateSeanceDto) {
    return this.prisma.seanceCDPrevue.update({
      where: { id_seance: id },
      data: {
        exercice: data.exercice,
        remarques: data.remarques,
        membres: {
          set: data.membre_ids?.map(id => ({ id_membre: id }))
        }
      },
      include: {
        membres: true
      }
    });
  }


 async getComiteBySeanceAndProcedure(seanceId: number, procedureId: number) {
  return this.prisma.comiteDirection.findFirst({
    where: { 
      id_seance: seanceId,
      id_procedure: procedureId
    },
    include: {
      seance: {
        include: {
          membres: true
        }
      },
      decisionCDs: true,
      procedure: true
    }
  });
}

async getSeancesWithComite(procedureId: number) {
  return this.prisma.seanceCDPrevue.findMany({
    where: {
      comites: {
        some: {
          id_procedure: procedureId
        }
      }
    },
    include: {
      membres: true,
      comites: {
        include: {
          decisionCDs: true
        }
      }
    }
  });
}


  async deleteSeance(id: number) {
    // First check if the seance has any comités associated
    const comites = await this.prisma.comiteDirection.findMany({
      where: { id_seance: id }
    });

    if (comites.length > 0) {
      throw new Error('Cannot delete seance with associated comités');
    }

    return this.prisma.seanceCDPrevue.delete({
      where: { id_seance: id }
    });
  }

  async deleteComite(id: number) {
    // First delete all decisions associated with this comité
    await this.prisma.decisionCD.deleteMany({
      where: { id_comite: id }
    });

    return this.prisma.comiteDirection.delete({
      where: { id_comite: id }
    });
  }

  // Seance CRUD operations
  async createSeance(data: CreateSeanceDto) {
    return this.prisma.seanceCDPrevue.create({
      data: {
        num_seance: this.generateSeanceNumber(data.exercice),
        date_seance: new Date(),
        exercice: data.exercice,
        remarques: data.remarques,
        membres: {
          connect: data.membre_ids.map(id => ({ id_membre: id }))
        }
      },
      include: {
        membres: true
      }
    });
  }

  async getSeances() {
    return this.prisma.seanceCDPrevue.findMany({
      include: {
        membres: true
      },
      orderBy: {
        date_seance: 'desc'
      }
    });
  }

  async getSeanceById(id: number) {
    return this.prisma.seanceCDPrevue.findUnique({
      where: { id_seance: id },
      include: {
        membres: true,
        comites: {
          include: {
            decisionCDs: true,
            procedure: {
              include: {
                demandes: true
              }
            }
          }
        }
      }
    });
  }

  // Comite CRUD operations
  async createComite(data: CreateComiteDto) {
    return this.prisma.comiteDirection.create({
      data: {
        seance: { connect: { id_seance: data.id_seance } },
        procedure: { connect: { id_proc: data.id_procedure } },
        date_comite: new Date(data.date_comite),
        numero_decision: data.numero_decision,
        objet_deliberation: data.objet_deliberation,
        resume_reunion: data.resume_reunion,
        fiche_technique: data.fiche_technique,
        carte_projettee: data.carte_projettee,
        rapport_police: data.rapport_police,
        instructeur: data.instructeur,
        decisionCDs: {
          create: data.decisions.map(decision => ({
            decision_cd: decision.decision_cd,
            duree_decision: decision.duree_decision,
            commentaires: decision.commentaires
          }))
        }
      },
      include: {
        seance: {
          include: {
            membres: true
          }
        },
        decisionCDs: true,
        procedure: true
      }
    });
  }

  async updateComite(id: number, data: UpdateComiteDto) {
    // First delete existing decisions
    await this.prisma.decisionCD.deleteMany({
      where: { id_comite: id }
    });

    return this.prisma.comiteDirection.update({
      where: { id_comite: id },
      data: {
        date_comite: new Date(data.date_comite!),
        numero_decision: data.numero_decision,
        objet_deliberation: data.objet_deliberation,
        resume_reunion: data.resume_reunion,
        fiche_technique: data.fiche_technique,
        carte_projettee: data.carte_projettee,
        rapport_police: data.rapport_police,
        instructeur: data.instructeur,
        decisionCDs: {
          create: data.decisions?.map(decision => ({
            decision_cd: decision.decision_cd,
            duree_decision: decision.duree_decision,
            commentaires: decision.commentaires
          }))
        }
      },
      include: {
        seance: true,
        decisionCDs: true,
        procedure: true
      }
    });
  }

async getComitesByProcedure(procedureId: number) {
  return this.prisma.comiteDirection.findMany({
    where: { id_procedure: procedureId },
    include: {
      seance: {
        include: {
          membres: true
        }
      },
      decisionCDs: true,
      procedure: {
        include: {
          demandes: true
        }
      }
    },
    orderBy: {
      date_comite: 'desc'
    }
  });
}

  async getComiteById(id: number) {
    return this.prisma.comiteDirection.findUnique({
      where: { id_comite: id },
      include: {
        seance: {
          include: {
            membres: true
          }
        },
        decisionCDs: true,
        procedure: {
          include: {
            demandes: true
          }
        }
      }
    });
  }

  // Members operations
  async getMembres() {
    return this.prisma.membresComite.findMany();
  }

  // Generate PDF report
  async generateComiteReport(comiteId: number) {
    const comite = await this.getComiteById(comiteId);
    if (!comite) {
      throw new Error('Comité non trouvé');
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Add content to PDF
    const { width, height } = page.getSize();
    const fontSize = 12;
    
    // Add title
    page.drawText('Rapport du Comité de Direction', {
      x: 50,
      y: height - 50,
      size: 18,
    });

    // Add comite details
    page.drawText(`Numéro de décision: ${comite.numero_decision}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
    });
    
    page.drawText(`Date: ${comite.date_comite.toLocaleDateString()}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
    });

    page.drawText(`Objet: ${comite.objet_deliberation}`, {
      x: 50,
      y: height - 140,
      size: fontSize,
    });

    // Add decisions
    page.drawText('Décisions:', {
      x: 50,
      y: height - 180,
      size: fontSize,
    });

    let yPosition = height - 200;
    comite.decisionCDs.forEach(decision => {
      page.drawText(
        `- ${decision.decision_cd === 'favorable' ? 'Favorable' : 'Défavorable'}` +
        (decision.duree_decision ? ` (${decision.duree_decision} ans)` : ''),
        { x: 60, y: yPosition, size: fontSize }
      );
      
      if (decision.commentaires) {
        yPosition -= 20;
        page.drawText(`  Motif: ${decision.commentaires}`, {
          x: 70,
          y: yPosition,
          size: fontSize - 2,
        });
      }
      
      yPosition -= 30;
    });

    // Add members
    page.drawText('Membres présents:', {
      x: 50,
      y: yPosition - 20,
      size: fontSize,
    });

    yPosition -= 40;
    comite.seance.membres.forEach(membre => {
      page.drawText(
        `- ${membre.prenom_membre} ${membre.nom_membre} (${membre.fonction_membre})`,
        { x: 60, y: yPosition, size: fontSize - 2 }
      );
      yPosition -= 20;
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  private generateSeanceNumber(exercice: number): string {
    return `CD-${exercice}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}