// prisma/seed_communs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Algerian administrative divisions...');

  // 1. First delete all existing data in reverse dependency order
  await prisma.commune.deleteMany();
  await prisma.daira.deleteMany();
  await prisma.wilaya.deleteMany();
  await prisma.antenne.deleteMany();

  // 2. Create Antennes (Regional Offices)
  const antennes = [
    { id_antenne: 1, nom: 'Antenne Nord', localisation: 'Alger' },
    { id_antenne: 2, nom: 'Antenne Est', localisation: 'Constantine' },
    { id_antenne: 3, nom: 'Antenne Ouest', localisation: 'Oran' },
    { id_antenne: 4, nom: 'Antenne Sud-Est', localisation: 'Ouargla' },
    { id_antenne: 5, nom: 'Antenne Sud-Ouest', localisation: 'Adrar' },
    { id_antenne: 6, nom: 'Antenne Centre', localisation: 'Djelfa' }
  ];

  for (const antenne of antennes) {
    await prisma.antenne.create({
      data: antenne
    });
  }

  // 3. Create Wilayas with their Antenne assignments
  const wilayas = [
    // Antenne Nord (id_antenne: 1)
    { code_wilaya: '16', nom_wilaya: 'Alger', id_antenne: 1 },
    { code_wilaya: '09', nom_wilaya: 'Blida', id_antenne: 1 },
    { code_wilaya: '10', nom_wilaya: 'Bouira', id_antenne: 1 },
    { code_wilaya: '35', nom_wilaya: 'Boumerdès', id_antenne: 1 },
    { code_wilaya: '42', nom_wilaya: 'Tipaza', id_antenne: 1 },
    
    // Antenne Est (id_antenne: 2)
    { code_wilaya: '25', nom_wilaya: 'Constantine', id_antenne: 2 },
    { code_wilaya: '23', nom_wilaya: 'Annaba', id_antenne: 2 },
    { code_wilaya: '24', nom_wilaya: 'Guelma', id_antenne: 2 },
    
    // ... Add all 58 wilayas with their correct antenne assignments
  ];

  for (const wilayaData of wilayas) {
    const wilaya = await prisma.wilaya.create({
      data: {
        code_wilaya: wilayaData.code_wilaya,
        nom_wilaya: wilayaData.nom_wilaya,
        id_antenne: wilayaData.id_antenne,
      }
    });

    // 4. Create Dairas for each Wilaya
    const dairas = getDairasForWilaya(wilaya.code_wilaya);
    for (const dairaData of dairas) {
      const daira = await prisma.daira.create({
        data: {
          code_daira: dairaData.code_daira,
          nom_daira: dairaData.nom_daira,
          id_wilaya: wilaya.id_wilaya
        }
      });

      // 5. Create Communes for each Daira
      const communes = getCommunesForDaira(daira.code_daira);
      for (const communeData of communes) {
        await prisma.commune.create({
          data: {
            code_commune: communeData.code_commune,
            nom_commune: communeData.nom_commune,
            id_daira: daira.id_daira
          }
        });
      }
    }
  }

  console.log('✅ All Algerian administrative divisions seeded successfully');
}

// Helper functions with sample data for 2 wilayas
function getDairasForWilaya(wilayaCode: string) {
  const dairasByWilaya: Record<string, Array<{code_daira: string, nom_daira: string}>> = {
    // Alger (16)
    '16': [
      { code_daira: '1601', nom_daira: 'Sidi M\'Hamed' },
      { code_daira: '1602', nom_daira: 'El Madania' },
      { code_daira: '1603', nom_daira: 'El Harrach' },
      { code_daira: '1604', nom_daira: 'Bab El Oued' },
      { code_daira: '1605', nom_daira: 'Bouzareah' },
      { code_daira: '1606', nom_daira: 'Bir Mourad Raïs' }
    ],
    // Oran (31)
    '31': [
      { code_daira: '3101', nom_daira: 'Oran' },
      { code_daira: '3102', nom_daira: 'Gdyel' },
      { code_daira: '3103', nom_daira: 'Bir El Djir' },
      { code_daira: '3104', nom_daira: 'Es Senia' }
    ]
    // Add data for all wilayas
  };
  return dairasByWilaya[wilayaCode] || [];
}

function getCommunesForDaira(dairaCode: string) {
  const communesByDaira: Record<string, Array<{code_commune: string, nom_commune: string}>> = {
    // Alger dairas
    '1601': [
      { code_commune: '160101', nom_commune: 'Sidi M\'Hamed' },
      { code_commune: '160102', nom_commune: 'El Annasser' }
    ],
    '1602': [
      { code_commune: '160201', nom_commune: 'Bab El Oued' },
      { code_commune: '160202', nom_commune: 'Bologhine' }
    ],
    // Oran dairas
    '3101': [
      { code_commune: '310101', nom_commune: 'Oran Centre' },
      { code_commune: '310102', nom_commune: 'Sidi El Houari' }
    ]
    // Add data for all dairas
  };
  return communesByDaira[dairaCode] || [];
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });