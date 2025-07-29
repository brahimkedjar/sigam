/*
  Warnings:

  - You are about to drop the column `id_demande` on the `Coordonnee` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutCoord" AS ENUM ('NOUVEAU', 'ANCIENNE');

-- DropForeignKey
ALTER TABLE "Coordonnee" DROP CONSTRAINT "Coordonnee_id_demande_fkey";

-- AlterTable
ALTER TABLE "Coordonnee" DROP COLUMN "id_demande";

-- CreateTable
CREATE TABLE "ProcedureCoord" (
    "id_procedureCoord" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "id_coordonnees" INTEGER NOT NULL,
    "statut_coord" "StatutCoord" NOT NULL,

    CONSTRAINT "ProcedureCoord_pkey" PRIMARY KEY ("id_procedureCoord")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureCoord_id_proc_id_coordonnees_key" ON "ProcedureCoord"("id_proc", "id_coordonnees");

-- AddForeignKey
ALTER TABLE "ProcedureCoord" ADD CONSTRAINT "ProcedureCoord_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureCoord" ADD CONSTRAINT "ProcedureCoord_id_coordonnees_fkey" FOREIGN KEY ("id_coordonnees") REFERENCES "Coordonnee"("id_coordonnees") ON DELETE RESTRICT ON UPDATE CASCADE;
