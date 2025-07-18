/*
  Warnings:

  - You are about to drop the column `domaine` on the `typeprocedure` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `typeprocedure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "procedure" ADD COLUMN     "id_permis" INTEGER;

-- AlterTable
ALTER TABLE "typeprocedure" DROP COLUMN "domaine",
DROP COLUMN "nom",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "libelle" TEXT;

-- CreateTable
CREATE TABLE "permis" (
    "id" SERIAL NOT NULL,
    "id_typePermis" INTEGER NOT NULL,
    "id_antenne" INTEGER,
    "id_detenteur" INTEGER,
    "id_statut" INTEGER,
    "code_permis" TEXT NOT NULL,
    "date_adjudication" TIMESTAMP(3),
    "date_octroi" TIMESTAMP(3),
    "date_expiration" TIMESTAMP(3),
    "date_annulation" TIMESTAMP(3),
    "date_renonciation" TIMESTAMP(3),
    "duree_validite" INTEGER NOT NULL,
    "lieu_dit" TEXT,
    "mode_attribution" TEXT,
    "superficie" DOUBLE PRECISION,
    "utilisation" TEXT,
    "statut_juridique_terrain" TEXT,
    "duree_prevue_travaux" INTEGER,
    "date_demarrage_travaux" TIMESTAMP(3),
    "statut_activites" TEXT,
    "commentaires" TEXT,

    CONSTRAINT "permis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutPermis" (
    "id" SERIAL NOT NULL,
    "lib_statut" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "StatutPermis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typepermis" (
    "id" SERIAL NOT NULL,
    "lib_type" TEXT NOT NULL,
    "code_type" TEXT NOT NULL,
    "regime" TEXT NOT NULL,
    "duree_initiale" INTEGER NOT NULL,
    "duree_renouv_max" INTEGER NOT NULL,
    "delai_renouv" INTEGER NOT NULL,
    "superficie_max" DOUBLE PRECISION,

    CONSTRAINT "typepermis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Antenne" (
    "id_antenne" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Antenne_pkey" PRIMARY KEY ("id_antenne")
);

-- CreateIndex
CREATE UNIQUE INDEX "permis_code_permis_key" ON "permis"("code_permis");

-- AddForeignKey
ALTER TABLE "permis" ADD CONSTRAINT "permis_id_typePermis_fkey" FOREIGN KEY ("id_typePermis") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permis" ADD CONSTRAINT "permis_id_statut_fkey" FOREIGN KEY ("id_statut") REFERENCES "StatutPermis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permis" ADD CONSTRAINT "permis_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permis" ADD CONSTRAINT "permis_id_antenne_fkey" FOREIGN KEY ("id_antenne") REFERENCES "Antenne"("id_antenne") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure" ADD CONSTRAINT "procedure_id_permis_fkey" FOREIGN KEY ("id_permis") REFERENCES "permis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
