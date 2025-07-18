import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.substance.createMany({
    data: [
      {
        nom_subFR: 'Fer',
        nom_subAR: 'الحديد',
        catégorie_sub: 'métalliques',
      },
      {
        nom_subFR: 'Cuivre',
        nom_subAR: 'النحاس',
        catégorie_sub: 'métalliques',
      },
      {
        nom_subFR: 'Argile',
        nom_subAR: 'الطين',
        catégorie_sub: 'non-métalliques',
      },
      {
        nom_subFR: 'Sable',
        nom_subAR: 'الرمل',
        catégorie_sub: 'non-métalliques',
      },
      {
        nom_subFR: 'Uranium',
        nom_subAR: 'اليورانيوم',
        catégorie_sub: 'radioactives',
      }
    ],
    skipDuplicates: true,
  });

  console.log('✅ Substances inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error inserting substances:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
