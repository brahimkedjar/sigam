// src/procedure/procedure.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcedureService {
  constructor(private prisma: PrismaService) {}

  async getAllProcedures() {
  return this.prisma.demande.findMany({
    include: {
      procedure: {
        include: {
          typeProcedure: true,
          ProcedureEtape: {
            include: {
              etape: true,
            },
            orderBy: {
              etape: {
                ordre_etape: 'asc',
              },
            },
          },
        },
      },
      detenteur: true,
    },
    orderBy: {
      date_demande: 'desc',
    },
  });
}

async getProceduresEnCours() {
  const data = await this.prisma.demande.findMany({
    where: {
      procedure: {
        statut_proc: {
          notIn: ['TERMINEE'],
        },
      },
      // You can also add optional filters here
    },
    include: {
      procedure: {
        include: {
          typeProcedure: true,
          ProcedureEtape: {
            include: {
              etape: true,
            },
            orderBy: {
              etape: {
                ordre_etape: 'asc',
              },
            },
          },
        },
      },
      detenteur: true,
    },
    orderBy: {
      date_demande: 'desc',
    },
  });

  console.log('>>> Procedures fetched from DB:', data.map(d => ({
    id: d.id_demande,
    etapes: d.procedure?.ProcedureEtape.map(p => ({
      statut: p.statut,
      lib_etape: p.etape?.lib_etape
    }))
  })));

  return data;
}


async deleteProcedureAndRelatedData(procedureId: number) { 
  return this.prisma.$transaction(async (prisma) => {
    // First get all related demandes for this procedure
    const demandes = await prisma.demande.findMany({
      where: { id_proc: procedureId },
      select: {
        id_demande: true,
        id_detenteur: true,
        id_expert: true
      }
    });
    
    const demandeIds = demandes.map(d => d.id_demande);
    const detenteurIds = demandes.map(d => d.id_detenteur).filter(id => id !== null) as number[];
    const expertIds = demandes.map(d => d.id_expert).filter(id => id !== null) as number[];

    // 1. Delete related DossierFournisDocument records
    await prisma.dossierFournisDocument.deleteMany({
      where: { 
        dossierFournis: { 
          id_demande: { in: demandeIds } 
        } 
      }
    });

    // 2. Delete related DossierFournis records
    await prisma.dossierFournis.deleteMany({
      where: { id_demande: { in: demandeIds } }
    });

    // 3. Delete related SubstanceAssocieeDemande records
    await prisma.substanceAssocieeDemande.deleteMany({
      where: { id_proc: procedureId }
    });

    // 4. Delete related InteractionWali records
    await prisma.interactionWali.deleteMany({
      where: { id_procedure: procedureId }
    });

    // Handle Comité de Direction related data
    // 1. Get all seances related to the procedure
    const seances = await prisma.seanceCDPrevue.findMany({
  where: {
    comites: {
      some: { 
        id_procedure: procedureId 
      }
    }
  },
  select: { 
    id_seance: true 
  }
});

    const seanceIds = seances.map(s => s.id_seance);

    if (seanceIds.length > 0) {
      // 2. Get all comites related to these seances AND the procedure's demandes
      const comites = await prisma.comiteDirection.findMany({
        where: {
          id_seance: { in: seanceIds },
        },
        select: { id_comite: true }
      });

      const comiteIds = comites.map(c => c.id_comite);

      // 3. Delete all decisions of these comites
      await prisma.decisionCD.deleteMany({
        where: {
          id_comite: { in: comiteIds }
        }
      });

      // 4. Delete all comites related to this procedure's demandes
      await prisma.comiteDirection.deleteMany({
        where: {
          id_seance: { in: seanceIds },
        }
      });

      // 5. Check if seances are used by other procedures before deleting
      for (const seanceId of seanceIds) {
  const otherProceduresCount = await prisma.procedure.count({
    where: {
      id_proc: { not: procedureId },
      id_seance: seanceId // ✅ correct way
    }
  });

        if (otherProceduresCount === 0) {
          // Only delete seance if no other procedures are using it
          await prisma.seanceCDPrevue.delete({
            where: { id_seance: seanceId }
          });
        }
      }
    }

    // 6. Delete related ProcedureEtape records
    await prisma.procedureEtape.deleteMany({
      where: { id_proc: procedureId }
    });

    // 7. Delete related Coordonnee records
    const links = await prisma.procedureCoord.findMany({
      where: { id_proc: procedureId },
      select: { id_coordonnees: true }
    });

    const coordIds = links.map(l => l.id_coordonnees);

    await prisma.procedureCoord.deleteMany({
      where: { id_proc: procedureId }
    });

    await prisma.coordonnee.deleteMany({
      where: { id_coordonnees: { in: coordIds } }
    });

    // 8. Delete the Demandes
    await prisma.demande.deleteMany({
      where: { id_proc: procedureId }
    });

    // 9. Check and delete DetenteurMorale if not referenced elsewhere
    const personnePhysiqueIdsToDelete: number[] = [];
    
    for (const detenteurId of detenteurIds) {
      const otherReferences = await prisma.demande.count({
        where: { 
          id_detenteur: detenteurId,
          id_proc: { not: procedureId }
        }
      });
      
      const permisReferences = await prisma.permis.count({
        where: { id_detenteur: detenteurId }
      });

      if (otherReferences === 0 && permisReferences === 0) {
        // First get all PersonnePhysique IDs related to this detenteur
        const fonctions = await prisma.fonctionPersonneMoral.findMany({
          where: { id_detenteur: detenteurId },
          select: { id_personne: true }
        });
        
        // Collect PersonnePhysique IDs for potential deletion
        personnePhysiqueIdsToDelete.push(...fonctions.map(f => f.id_personne));

        // Delete related FonctionPersonneMoral records
        await prisma.fonctionPersonneMoral.deleteMany({
          where: { id_detenteur: detenteurId }
        });

        // Delete related RegistreCommerce if exists
        await prisma.registreCommerce.deleteMany({
          where: { id_detenteur: detenteurId }
        });

        // Delete the DetenteurMorale
        await prisma.detenteurMorale.delete({
          where: { id_detenteur: detenteurId }
        });
      }
    }

    // 10. Check and delete PersonnePhysique records if they're not referenced elsewhere
    for (const personneId of personnePhysiqueIdsToDelete) {
      const otherFonctionReferences = await prisma.fonctionPersonneMoral.count({
        where: { id_personne: personneId }
      });

      if (otherFonctionReferences === 0) {
        await prisma.personnePhysique.delete({
          where: { id_personne: personneId }
        });
      }
    }

    // 11. Check and delete ExpertMinier if not referenced elsewhere
    for (const expertId of expertIds) {
      const otherReferences = await prisma.demande.count({
        where: { 
          id_expert: expertId,
          id_proc: { not: procedureId }
        }
      });

      if (otherReferences === 0) {
        await prisma.expertMinier.delete({
          where: { id_expert: expertId }
        });
      }
    }

    // 12. Delete ProcedureRenouvellement if exists
    await prisma.procedureRenouvellement.deleteMany({
      where: { id_proc: procedureId }
    });

    // 13. Finally, delete the Procedure itself
    return prisma.procedure.delete({
      where: { id_proc: procedureId }
    });
  });
}

async terminerProcedure(idProc: number) {
  const procedure = await this.prisma.procedure.findUnique({
    where: { id_proc: idProc },
    include: { demandes: true }, // plural!
  });

  if (!procedure || procedure.demandes.length === 0) {
    throw new NotFoundException('Procédure ou demande introuvable');
  }

  const demande = procedure.demandes[0]; // Assuming only one demande per procédure
  const now = new Date();

  await this.prisma.$transaction([
    this.prisma.procedure.update({
      where: { id_proc: idProc },
      data: {
        statut_proc: 'TERMINEE',
        date_fin_proc: now,
      },
    }),
    this.prisma.demande.update({
      where: { id_demande: demande.id_demande },
      data: {
        statut_demande: 'ACCEPTEE',
        date_fin: now,
      },
    }),
  ]);

  return { success: true };
}


}
