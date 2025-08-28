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
    { code_wilaya: '16', nom_wilayaFR: 'Alger',nom_wilayaAR: 'Alger', id_antenne: 1,zone:'zone A' },
    { code_wilaya: '09', nom_wilayaFR: 'Blida',nom_wilayaAR: 'Alger', id_antenne: 1,zone:'zone A' },
    { code_wilaya: '10', nom_wilayaFR: 'Bouira',nom_wilayaAR: 'Alger', id_antenne: 1,zone:'zone A' },
    { code_wilaya: '35', nom_wilayaFR: 'Boumerdès',nom_wilayaAR: 'Alger', id_antenne: 1,zone:'zone A' },
    { code_wilaya: '42', nom_wilayaFR: 'Tipaza',nom_wilayaAR: 'Alger', id_antenne: 1,zone:'zone A' },
    
    // Antenne Est (id_antenne: 2)
    { code_wilaya: '25', nom_wilayaFR: 'Constantine',nom_wilayaAR: 'Alger', id_antenne: 2,zone:'zone A' },
    { code_wilaya: '23', nom_wilayaFR: 'Annaba',nom_wilayaAR: 'Alger', id_antenne: 2,zone:'zone A' },
    { code_wilaya: '24', nom_wilayaFR: 'Guelma',nom_wilayaAR: 'Alger', id_antenne: 2 ,zone:'zone A'},
    
    // ... Add all 58 wilayas with their correct antenne assignments
  ];

  for (const wilayaData of wilayas) {
    const wilaya = await prisma.wilaya.create({
      data: {
        code_wilaya: wilayaData.code_wilaya,
        nom_wilayaFR: wilayaData.nom_wilayaFR,
        nom_wilayaAR:wilayaData.nom_wilayaFR,
        id_antenne: wilayaData.id_antenne,
        zone:wilayaData.zone
      }
    });

    // 4. Create Dairas for each Wilaya
    const dairas = getDairasForWilaya(wilaya.code_wilaya);
    for (const dairaData of dairas) {
      const daira = await prisma.daira.create({
        data: {
          code_daira: dairaData.code_daira,
          nom_dairaFR: dairaData.nom_dairaFR,
          nom_dairaAR: dairaData.nom_dairaAR,
          id_wilaya: wilaya.id_wilaya
        }
      });

      // 5. Create Communes for each Daira
      const communes = getCommunesForDaira(daira.code_daira);
      for (const communeData of communes) {
        await prisma.commune.create({
          data: {
            code_commune: communeData.code_commune,
            nom_communeFR: communeData.nom_communeFR,
            nom_communeAR: communeData.nom_communeAR,
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
  const dairasByWilaya: Record<string, Array<{code_daira: string, nom_dairaFR: string,nom_dairaAR: string}>> = {
    // Alger (16)
    '16': [
      { code_daira: '1601', nom_dairaFR: 'Sidi M\'Hamed',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '1602', nom_dairaFR: 'El Madania',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '1603', nom_dairaFR: 'El Harrach',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '1604', nom_dairaFR: 'Bab El Oued',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '1605', nom_dairaFR: 'Bouzareah',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '1606', nom_dairaFR: 'Bir Mourad Raïs',nom_dairaAR:'Sidi M\'Hamed' }
    ],
    // Oran (31)
    '31': [
      { code_daira: '3101', nom_dairaFR: 'Oran',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '3102', nom_dairaFR: 'Gdyel',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '3103', nom_dairaFR: 'Bir El Djir',nom_dairaAR:'Sidi M\'Hamed' },
      { code_daira: '3104', nom_dairaFR: 'Es Senia',nom_dairaAR:'Sidi M\'Hamed' }
    ]
    // Add data for all wilayas
  };
  return dairasByWilaya[wilayaCode] || [];
}

function getCommunesForDaira(dairaCode: string) {
  const communesByDaira: Record<string, Array<{code_commune: string,nom_communeFR:string,nom_communeAR:string}>> = {
    // Alger dairas
    '1601': [
      { code_commune: '160101', nom_communeFR: 'Sidi M\'Hamed',nom_communeAR:'Oran Centre'  },
      { code_commune: '160102', nom_communeFR: 'El Annasser',nom_communeAR:'Oran Centre'  }
    ],
    '1602': [
      { code_commune: '160201', nom_communeFR: 'Bab El Oued',nom_communeAR:'Oran Centre'  },
      { code_commune: '160202', nom_communeFR: 'Bologhine',nom_communeAR:'Oran Centre'  }
    ],
    // Oran dairas
    '3101': [
      { code_commune: '310101', nom_communeFR: 'Oran Centre',nom_communeAR:'Oran Centre' },
      { code_commune: '310102', nom_communeFR: 'Sidi El Houari',nom_communeAR:'Oran Centre'  }
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