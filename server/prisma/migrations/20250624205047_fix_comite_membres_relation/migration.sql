/*
  Warnings:

  - You are about to drop the `CD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MembreComite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MembresCD` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EnumDecisionComite" AS ENUM ('favorable', 'defavorable');

-- DropForeignKey
ALTER TABLE "CD" DROP CONSTRAINT "CD_id_procedure_fkey";

-- DropForeignKey
ALTER TABLE "MembresCD" DROP CONSTRAINT "MembresCD_id_comite_fkey";

-- DropForeignKey
ALTER TABLE "MembresCD" DROP CONSTRAINT "MembresCD_id_membre_fkey";

-- DropTable
DROP TABLE "CD";

-- DropTable
DROP TABLE "MembreComite";

-- DropTable
DROP TABLE "MembresCD";

-- CreateTable
CREATE TABLE "ComiteDirection" (
    "id_comite" SERIAL NOT NULL,
    "id_procedure" INTEGER NOT NULL,
    "date_comite" TIMESTAMP(3) NOT NULL,
    "numero_decision" TEXT NOT NULL,
    "objet_deliberation" TEXT NOT NULL,
    "decision_comite" "EnumDecisionComite" NOT NULL,
    "resume_reunion" TEXT NOT NULL,
    "motif" TEXT,
    "fiche_technique" TEXT,
    "carte_projettee" TEXT,
    "rapport_police" TEXT,
    "instructeur" TEXT,

    CONSTRAINT "ComiteDirection_pkey" PRIMARY KEY ("id_comite")
);

-- CreateTable
CREATE TABLE "MembresComite" (
    "id_membre" SERIAL NOT NULL,
    "nom_membre" TEXT NOT NULL,
    "prenom_membre" TEXT NOT NULL,
    "fonction_membre" TEXT NOT NULL,
    "email_membre" TEXT NOT NULL,

    CONSTRAINT "MembresComite_pkey" PRIMARY KEY ("id_membre")
);

-- CreateTable
CREATE TABLE "_ComiteMembres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ComiteMembres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ComiteMembres_B_index" ON "_ComiteMembres"("B");

-- AddForeignKey
ALTER TABLE "ComiteDirection" ADD CONSTRAINT "ComiteDirection_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComiteMembres" ADD CONSTRAINT "_ComiteMembres_A_fkey" FOREIGN KEY ("A") REFERENCES "ComiteDirection"("id_comite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComiteMembres" ADD CONSTRAINT "_ComiteMembres_B_fkey" FOREIGN KEY ("B") REFERENCES "MembresComite"("id_membre") ON DELETE CASCADE ON UPDATE CASCADE;
