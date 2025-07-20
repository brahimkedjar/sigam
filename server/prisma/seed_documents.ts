// seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
 // Complete Seed Script for Mining Permits Application System

const dossierData = [
  // 1. Permis de prospection (PPM) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 1, // Permis de prospection
    nombre_doc: 8,
    remarques: "Dossier standard de demande de permis de prospection minière",
    documents: [
      {
        nom_doc: "Demande sur imprimé de l'agence nationale des activités minières",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts de la société",
        description: "Statuts juridiques de la société demandeuse",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du registre de commerce",
        description: "Preuve d'enregistrement commercial",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs de capacités techniques",
        description: "Compétences en recherches minières et moyens techniques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités financières",
        description: "Bilans et comptes d'exploitation des 3 derniers exercices",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme et planning des travaux",
        description: "Détail des travaux prévus et méthodes de prospection",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Carte localisant le périmètre demandé avec coordonnées UTM",
        format: "PDF/Image",
        taille_doc: "1/25.000 au 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Cahier des charges renseigné",
        description: "Document contractuel dûment complété et signé",
        format: "PDF",
        taille_doc: "Variable"
      },
      
    ]
  },
  
  // 2. Permis de prospection (PPM) - Renouvellement
  {
    id_typeproc: 2, // Renouvellement
    id_typePermis: 1, // Permis de prospection
    nombre_doc: 4,
    remarques: "Dossier standard de demande de prorogation de permis de prospection minière",
    documents: [
      {
        nom_doc: "Demande de renouvellement sur imprimé de l'agence",
        description: "Formulaire officiel de demande de prorogation",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Rapport sur les travaux effectués",
        description: "Bilan des travaux réalisés pendant la période précédente",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme et planning des nouveaux travaux",
        description: "Détail des travaux prévus pour la période de renouvellement",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT actualisée",
        description: "Carte localisant le périmètre avec coordonnées UTM",
        format: "PDF/Image",
        taille_doc: "1/25.000 au 1/50.000 ou 1/200.000"
      }
    ]
  },

  // 3. Permis d'exploration (PEM) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 2, // Permis d'exploration
    nombre_doc: 14,
    remarques: "Dossier standard de demande de permis d'exploration minière",
    documents: [
      {
        nom_doc: "Demande sur imprimé de l'agence nationale des activités minières",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts de la société",
        description: "Statuts juridiques de la société demandeuse",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du registre de commerce",
        description: "Preuve d'enregistrement commercial",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs de capacités techniques",
        description: "Compétences en exploration minière et moyens techniques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités financières",
        description: "Bilans et comptes d'exploitation des 3 derniers exercices",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Mémoire sur les travaux réalisés",
        description: "Rapport sur les résultats des explorations précédentes",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Présentation de l'objectif et méthodologie",
        description: "Étude de mise en valeur du gisement",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme de développement des travaux",
        description: "Coûts, planning et méthodes d'exploration",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Encadrement technique et emploi",
        description: "Plan de ressources humaines",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude d'impact sur l'environnement",
        description: "Analyse des impacts environnementaux",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Carte localisant le périmètre demandé",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Cahier des charges renseigné",
        description: "Document contractuel dûment complété et signé",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du permis de prospection minière",
        description: "Si applicable - permis en cours de validité",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Rapport sur les travaux réalisés",
        description: "Résultats obtenus par la prospection minière",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 4. Permis d'exploration (PEM) - Renouvellement
  {
    id_typeproc: 2, // Renouvellement
    id_typePermis: 2, // Permis d'exploration
    nombre_doc: 10,
    remarques: "Dossier standard de prorogation de permis d'exploration minière",
    documents: [
      {
        nom_doc: "Demande de renouvellement sur imprimé de l'agence",
        description: "Formulaire officiel de demande de prorogation",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie du permis d'exploration en cours",
        description: "Permis dont la prorogation est demandée",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT actualisée",
        description: "Localisation du périmètre minier",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Rapport géologique sur les travaux effectués",
        description: "Illustré par des plans, croquis et coupes",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "État d'exécution des engagements",
        description: "Bilan des engagements souscrits",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme et planning des travaux projetés",
        description: "Avec estimation des dépenses",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Moyens humains et matériels à mettre en œuvre",
        description: "Plan de ressources pour la nouvelle période",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude d'impact sur l'environnement actualisée",
        description: "Incluant mesures d'atténuation et remise en état",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Attestation de paiement des droits et taxes",
        description: "Preuve que le demandeur est à jour",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Cahier des charges actualisé",
        description: "Document contractuel mis à jour et signé",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 5. Permis d'exploitation (PEX) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 3, // Permis d'exploitation
    nombre_doc: 13,
    remarques: "Dossier standard de demande de permis d'exploitation de mines",
    documents: [
      {
        nom_doc: "Demande sur imprimé de l'agence nationale des activités minières",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts de la société",
        description: "Statuts juridiques de la société demandeuse",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du registre de commerce",
        description: "Preuve d'enregistrement commercial",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs de capacités techniques",
        description: "Références dans l'exploitation minière",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités financières",
        description: "Bilans des 3 derniers exercices",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du permis d'exploration minière",
        description: "Si applicable - permis en cours de validité",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Rapport sur les travaux réalisés",
        description: "Résultats des phases de recherche minière",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie de l'étude de faisabilité",
        description: "Étude technique et économique détaillée",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Carte localisant le périmètre demandé",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Étude d'impact sur l'environnement",
        description: "Avec plan de gestion environnemental",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude de dangers",
        description: "Analyse des risques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Autorisation d'établissement classé",
        description: "Document d'autorisation",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme de restauration",
        description: "Plan de remise en état des lieux",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 6. Permis d'exploitation (PEX) - Renouvellement
  {
    id_typeproc: 2, // Renouvellement
    id_typePermis: 3, // Permis d'exploitation
    nombre_doc: 12,
    remarques: "Dossier standard de renouvellement de permis d'exploitation de mines",
    documents: [
      {
        nom_doc: "Demande de renouvellement sur imprimé de l'agence",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie du permis d'exploitation en cours",
        description: "Permis dont le renouvellement est demandé",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Rapport sur les travaux d'exploitation réalisés",
        description: "Investissements, productions et protection environnementale",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Rapport géologique actualisé",
        description: "Sur le ou les gisement(s) exploité(s)",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Rapport sur les travaux d'exploration complémentaire",
        description: "Si applicable - travaux réalisés pendant la période",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude de faisabilité technique et économique actualisée",
        description: "Nouveau plan de développement et d'exploitation",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Plan d'encadrement technique et emploi",
        description: "Ressources humaines pour la nouvelle période",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Engagement de rapport géologique biennal",
        description: "Engagement formel de fournir des rapports",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Attestation de paiement des droits et taxes",
        description: "Preuve que le demandeur est à jour",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude d'impact sur l'environnement actualisée",
        description: "Avec plan de gestion environnemental",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "État de la remise en état des lieux",
        description: "Bilan des actions déjà réalisées",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Cahier des charges actualisé",
        description: "Document contractuel mis à jour et signé",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 7. Permis de recherche carrière (PRC) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 5, // Permis de recherche carrière
    nombre_doc: 8,
    remarques: "Dossier standard de demande de permis de recherche carrière",
    documents: [
      {
        nom_doc: "Demande sur imprimé de la wilaya ou de l'agence",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts de la société",
        description: "Statuts juridiques de la société demandeuse",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du registre de commerce",
        description: "Preuve d'enregistrement commercial",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs de capacités techniques",
        description: "Compétences en recherche carrière",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités financières",
        description: "Bilans des 3 derniers exercices",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme et planning des travaux",
        description: "Détail des travaux de recherche prévus",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Localisation du périmètre demandé",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Cahier des charges renseigné",
        description: "Document contractuel dûment complété et signé",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 8. Permis d'exploitation carrière (PEC) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 6, // Permis d'exploitation carrière
    nombre_doc: 14,
    remarques: "Dossier standard de demande de permis d'exploitation de carrières",
    documents: [
      {
        nom_doc: "Demande sur imprimé de la wilaya ou de l'agence",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts de la société",
        description: "Statuts juridiques de la société demandeuse",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du registre de commerce",
        description: "Preuve d'enregistrement commercial",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs de capacités techniques",
        description: "Références dans l'exploitation de carrières",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités financières",
        description: "Bilans des 3 derniers exercices",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie du permis de recherche carrière",
        description: "Si applicable - permis en cours de validité",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Mémoire sur les travaux réalisés",
        description: "Résultats des phases de recherche",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Copie de l'étude de faisabilité",
        description: "Étude technique et économique détaillée",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Caractéristiques du tout-venant",
        description: "Pour les matériaux de construction",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Schéma de traitement validé",
        description: "Procédé retenu pour les matériaux",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Localisation du périmètre demandé",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Étude d'impact sur l'environnement",
        description: "Avec plan de gestion environnemental",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Étude de dangers",
        description: "Analyse des risques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Programme de restauration",
        description: "Plan de remise en état des lieux",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 9. Autorisation artisanale mine (ARM) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 7, // Autorisation artisanale mine
    nombre_doc: 8,
    remarques: "Dossier standard de demande d'autorisation artisanale minière",
    documents: [
      {
        nom_doc: "Demande sur imprimé de l'agence",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts ou pièce d'identité",
        description: "Pour personnes morales ou physiques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités techniques et financières",
        description: "Capacités à réaliser le projet",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Localisation du périmètre demandé",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Mémoire technique",
        description: "Méthode retenue d'exploitation artisanale",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Substances visées",
        description: "Liste des substances à exploiter",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Notice ou étude d'impact",
        description: "Selon l'incidence sur l'environnement",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Cahier des charges renseigné",
        description: "Document contractuel dûment complété et signé",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  },

  // 10. Permis de ramassage (PRA) - Demande initiale
  {
    id_typeproc: 1, // Demande initiale
    id_typePermis: 9, // Permis de ramassage
    nombre_doc: 7,
    remarques: "Dossier standard de demande de permis de ramassage",
    documents: [
      {
        nom_doc: "Demande sur imprimé de l'agence",
        description: "Formulaire officiel de demande",
        format: "PDF",
        taille_doc: "A4"
      },
      {
        nom_doc: "Copie des statuts ou pièce d'identité",
        description: "Pour personnes morales ou physiques",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Justificatifs des capacités techniques et financières",
        description: "Capacités à réaliser l'activité de ramassage",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Carte topographique INCT",
        description: "Localisation de la zone de ramassage",
        format: "PDF/Image",
        taille_doc: "1/25.000, 1/50.000 ou 1/200.000"
      },
      {
        nom_doc: "Mémoire technique",
        description: "Méthode retenue de ramassage, collecte ou récolte",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Substances visées",
        description: "Liste des substances à ramasser",
        format: "PDF",
        taille_doc: "Variable"
      },
      {
        nom_doc: "Notice d'impact sur l'environnement",
        description: "Analyse des impacts environnementaux",
        format: "PDF",
        taille_doc: "Variable"
      }
    ]
  }
];

// Implementation script
async function seedDatabase() {
  console.log("Starting database seeding...");
  
  // First, create all unique documents
  const allDocuments: {[key: string]: any} = {};
  for (const dossier of dossierData) {
    for (const doc of dossier.documents) {
      const key = `${doc.nom_doc}-${doc.description}-${doc.format}`;
      if (!allDocuments[key]) {
        allDocuments[key] = doc;
      }
    }
  }
  
  // Create documents in database and map them
  const documentMap = new Map<string, number>();
  for (const [key, doc] of Object.entries(allDocuments)) {
    const existingDoc = await prisma.document.findFirst({
      where: {
        nom_doc: doc.nom_doc,
        description: doc.description,
        format: doc.format
      }
    });
    
    if (!existingDoc) {
      const createdDoc = await prisma.document.create({
        data: {
          nom_doc: doc.nom_doc,
          description: doc.description,
          format: doc.format,
          taille_doc: doc.taille_doc
        }
      });
      documentMap.set(key, createdDoc.id_doc);
    } else {
      documentMap.set(key, existingDoc.id_doc);
    }
  }
  
  console.log(`Using ${documentMap.size} unique documents`);
  
  // Then create dossiers and their relationships
  for (const dossier of dossierData) {
    try {
      // Check if dossier already exists
      const existingDossier = await prisma.dossierAdministratif.findFirst({
        where: {
          id_typeproc: dossier.id_typeproc,
          id_typePermis: dossier.id_typePermis
        }
      });
      
      let createdDossier;
      
      if (!existingDossier) {
        createdDossier = await prisma.dossierAdministratif.create({
          data: {
            id_typeproc: dossier.id_typeproc,
            id_typePermis: dossier.id_typePermis,
            nombre_doc: dossier.nombre_doc,
            remarques: dossier.remarques
          }
        });
        console.log(`Created dossier ${createdDossier.id_dossier}`);
      } else {
        createdDossier = existingDossier;
        console.log(`Using existing dossier ${createdDossier.id_dossier}`);
      }

      // Create dossierDocument relationships
      for (const doc of dossier.documents) {
        const key = `${doc.nom_doc}-${doc.description}-${doc.format}`;
        const docId = documentMap.get(key);
        
        if (!docId) {
          throw new Error(`Document not found: ${key}`);
        }
        
        // Check if relationship already exists
        const existingRelation = await prisma.dossierDocument.findFirst({
          where: {
            id_dossier: createdDossier.id_dossier,
            id_doc: docId
          }
        });
        
        if (!existingRelation) {
          await prisma.dossierDocument.create({
            data: {
              id_dossier: createdDossier.id_dossier,
              id_doc: docId
            }
          });
        }
      }
      
      console.log(`Processed ${dossier.documents.length} document relations for dossier`);
    } catch (error) {
      console.error(`Error processing dossier:`, error);
    }
  }
  
  console.log("Database seeding completed!");
}

// Execute the seeding function
seedDatabase()
  .then(() => {
    console.log("Seeding process finished successfully");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Error during seeding:", e);
    prisma.$disconnect();
    process.exit(1);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });