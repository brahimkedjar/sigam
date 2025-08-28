import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.pays.createMany({
    data: [
      { nom_pays: "Algérie", nationalite: "Algérienne" },
      { nom_pays: "Maroc", nationalite: "Marocaine" },
      { nom_pays: "Tunisie", nationalite: "Tunisienne" },
      { nom_pays: "France", nationalite: "Française" },
      { nom_pays: "Italie", nationalite: "Italienne" },
      { nom_pays: "Espagne", nationalite: "Espagnole" },
      { nom_pays: "États-Unis", nationalite: "Américaine" },
      { nom_pays: "Canada", nationalite: "Canadienne" },
      { nom_pays: "Chine", nationalite: "Chinoise" },
      { nom_pays: "Turquie", nationalite: "Turque" },
    ],
    skipDuplicates: true, // avoid inserting duplicates if you rerun
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
