// seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPaymentData() {
  // First create BaremProduitetDroit entries
  await prisma.baremProduitetDroit.createMany({
    data: [
      // Mining Prospection
      { id: 1, montant_droit_etab: 30000, produit_attribution: 1500000 },
      // Mining Exploration
      { id: 2, montant_droit_etab: 40000, produit_attribution: 1500000 },
      // Mining Exploitation
      { id: 3, montant_droit_etab: 75000, produit_attribution: 1500000 },
      // Small Mine
      { id: 4, montant_droit_etab: 40000, produit_attribution: 1500000 },
      // Quarry Research
      { id: 5, montant_droit_etab: 100000, produit_attribution: 3000000 },
      // Quarry Exploitation
      { id: 6, montant_droit_etab: 100000, produit_attribution: 3000000 },
      // Artisanal Mine
      { id: 7, montant_droit_etab: 40000, produit_attribution: 1500000 },
      // Artisanal Quarry
      { id: 8, montant_droit_etab: 40000, produit_attribution: 3000000 },
      // Collection Permit
      { id: 9, montant_droit_etab: 30000, produit_attribution: 0 },
      // Transport Permit
      { id: 10, montant_droit_etab: 0, produit_attribution: 0 }
    ],
    skipDuplicates: true
  });

  // Create SuperficiaireBareme entries
  await prisma.superficiaireBareme.createMany({
    data: [
      // Mining Exploration (PEM)
      { 
        id: 1,
        droit_fixe: 5000,
        periode_initiale: 100,
        premier_renouv: 150,
        autre_renouv: 200,
        devise: 'DZD'
      },
      // Mining Exploitation (PEX)
      { 
        id: 2,
        droit_fixe: 10000,
        periode_initiale: 200,
        premier_renouv: 250,
        autre_renouv: 300,
        devise: 'DZD'
      },
      // Small Mine Exploration
      { 
        id: 3,
        droit_fixe: 5000,
        periode_initiale: 100,
        premier_renouv: 150,
        autre_renouv: 200,
        devise: 'DZD'
      },
      // Small Mine Exploitation
      { 
        id: 4,
        droit_fixe: 10000,
        periode_initiale: 200,
        premier_renouv: 250,
        autre_renouv: 300,
        devise: 'DZD'
      },
      // Quarry Research
      { 
        id: 5,
        droit_fixe: 5000,
        periode_initiale: 150,
        premier_renouv: 200,
        autre_renouv: 150,
        devise: 'DZD'
      },
      // Quarry Exploitation
      { 
        id: 6,
        droit_fixe: 10000,
        periode_initiale: 250,
        premier_renouv: 300,
        autre_renouv: 350,
        devise: 'DZD'
      },
      // Artisanal Mine
      { 
        id: 7,
        droit_fixe: 5000,
        periode_initiale: 100,
        premier_renouv: 150,
        autre_renouv: 200,
        devise: 'DZD'
      },
      // Artisanal Quarry
      { 
        id: 8,
        droit_fixe: 5000,
        periode_initiale: 150,
        premier_renouv: 200,
        autre_renouv: 150,
        devise: 'DZD'
      },
      // Collection Permit
      { 
        id: 9,
        droit_fixe: 0,
        periode_initiale: 0,
        premier_renouv: 0,
        autre_renouv: 0,
        devise: 'DZD'
      },
      // Transport Permit
      { 
        id: 10,
        droit_fixe: 0,
        periode_initiale: 0,
        premier_renouv: 0,
        autre_renouv: 0,
        devise: 'DZD'
      }
    ],
    skipDuplicates: true
  });

  // Create TypePaiement entries
  await prisma.typePaiement.createMany({
    data: [
      {
        libelle: 'Produit d\'attribution',
        frequence: 'Unique',
        details_calcul: 'Montant fixe selon le type de permis'
      },
      {
        libelle: 'Droit d\'établissement',
        frequence: 'Unique',
        details_calcul: 'Montant fixe selon le type de permis et la procédure'
      },
      {
        libelle: 'Taxe superficiaire',
        frequence: 'Annuel',
        details_calcul: '(Droit fixe + (Droit proportionnel * superficie)) * 12 / 5'
      },
      {
        libelle: 'Redevance minière',
        frequence: 'Annuel',
        details_calcul: 'Pourcentage de la production'
      },
      {
        libelle: 'Frais de dossier',
        frequence: 'Unique',
        details_calcul: 'Montant fixe'
      }
    ],
    skipDuplicates: true
  });

  console.log('Payment data seeded successfully');
}

// Then run your existing seed functions
async function main() {
  await seedPaymentData();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });