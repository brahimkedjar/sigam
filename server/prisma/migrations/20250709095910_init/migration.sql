/*
  Warnings:

  - Added the required column `id_droit` to the `typepermis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_taxe` to the `typepermis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_droit` to the `typeprocedure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "typepermis" ADD COLUMN     "id_droit" INTEGER NOT NULL,
ADD COLUMN     "id_taxe" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "typeprocedure" ADD COLUMN     "id_droit" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "barem_produit_droit" (
    "id" SERIAL NOT NULL,
    "montant_droit_etab" DOUBLE PRECISION NOT NULL,
    "produit_attribution" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "barem_produit_droit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superficiaire_bareme" (
    "id" SERIAL NOT NULL,
    "droit_fixe" DOUBLE PRECISION NOT NULL,
    "periode_initiale" DOUBLE PRECISION NOT NULL,
    "premier_renouv" DOUBLE PRECISION NOT NULL,
    "autre_renouv" DOUBLE PRECISION NOT NULL,
    "devise" TEXT NOT NULL,

    CONSTRAINT "superficiaire_bareme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_id_droit_fkey" FOREIGN KEY ("id_droit") REFERENCES "barem_produit_droit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_id_taxe_fkey" FOREIGN KEY ("id_taxe") REFERENCES "superficiaire_bareme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typeprocedure" ADD CONSTRAINT "typeprocedure_id_droit_fkey" FOREIGN KEY ("id_droit") REFERENCES "barem_produit_droit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
