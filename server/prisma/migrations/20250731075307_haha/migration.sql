/*
  Warnings:

  - You are about to drop the column `nombre_renouvellement` on the `ProcedureRenouvellement` table. All the data in the column will be lost.
  - Added the required column `nombre_renouvellements` to the `permis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProcedureRenouvellement" DROP COLUMN "nombre_renouvellement";

-- AlterTable
ALTER TABLE "permis" ADD COLUMN     "nombre_renouvellements" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "typepermis" ALTER COLUMN "duree_initiale" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "duree_renouv" SET DATA TYPE DOUBLE PRECISION;
