// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Antennes
  const antenne1 = await prisma.antenne.create({
    data: {
      nom: 'Antenne Nord',
      localisation: 'Alger',
    },
  });

  const antenne2 = await prisma.antenne.create({
    data: {
      nom: 'Antenne Sud',
      localisation: 'Ouargla',
    },
  });

  // Create Wilayas
  const wilayas = [
    { code_wilaya: '01', nom_wilaya: 'Adrar', id_antenne: antenne2.id_antenne },
    { code_wilaya: '16', nom_wilaya: 'Alger', id_antenne: antenne1.id_antenne },
    // Add all 58 wilayas with their respective antennes
  ];

  for (const wilayaData of wilayas) {
    const wilaya = await prisma.wilaya.create({
      data: wilayaData,
    });

    // Create Daira for each wilaya
    const dairaData = getDairasForWilaya(wilaya.code_wilaya);
    for (const daira of dairaData) {
      const createdDaira = await prisma.daira.create({
        data: {
          ...daira,
          id_wilaya: wilaya.id_wilaya,
        },
      });

      // Create Communes for each daira
      const communeData = getCommunesForDaira(createdDaira.code_daira);
      for (const commune of communeData) {
        await prisma.commune.create({
          data: {
            ...commune,
            id_daira: createdDaira.id_daira,
          },
        });
      }
    }
  }
}

// Helper functions with sample data
function getDairasForWilaya(wilayaCode: string) {
  const dairasByWilaya: Record<string, Array<{code_daira: string, nom_daira: string}>> = {
    '01': [
      { code_daira: '0101', nom_daira: 'Adrar' },
      { code_daira: '0102', nom_daira: 'Aoulef' },
      // ... other dairas for Adrar
    ],
    '16': [
      { code_daira: '1601', nom_daira: 'Sidi M\'Hamed' },
      { code_daira: '1602', nom_daira: 'El Madania' },
      // ... other dairas for Alger
    ],
    // Add data for all wilayas
  };
  return dairasByWilaya[wilayaCode] || [];
}

function getCommunesForDaira(dairaCode: string) {
  const communesByDaira: Record<string, Array<{code_commune: string, nom_commune: string}>> = {
    '0101': [
      { code_commune: '010101', nom_commune: 'Adrar' },
      { code_commune: '010102', nom_commune: 'Tamest' },
      // ... other communes for Adrar daira
    ],
    '1601': [
      { code_commune: '160101', nom_commune: 'Sidi M\'Hamed' },
      { code_commune: '160102', nom_commune: 'El Biar' },
      // ... other communes for Sidi M'Hamed daira
    ],
    // Add data for all dairas
  };
  return communesByDaira[dairaCode] || [];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });