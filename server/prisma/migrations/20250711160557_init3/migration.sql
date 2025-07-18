/*
  Warnings:

  - The `statut_demande` column on the `demande` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `statut_proc` on the `procedure` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `statut` on the `procedure_etape` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatutProcedure" AS ENUM ('EN_COURS', 'TERMINEE', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('ACCEPTEE', 'REJETEE');

-- AlterTable
ALTER TABLE "demande" DROP COLUMN "statut_demande",
ADD COLUMN     "statut_demande" "StatutDemande";

-- AlterTable
ALTER TABLE "procedure" DROP COLUMN "statut_proc",
ADD COLUMN     "statut_proc" "StatutProcedure" NOT NULL;

-- AlterTable
ALTER TABLE "procedure_etape" DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutProcedure" NOT NULL;
