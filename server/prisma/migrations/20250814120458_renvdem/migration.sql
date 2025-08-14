/*
  Warnings:

  - You are about to drop the column `id_proc` on the `ProcedureRenouvellement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_demande]` on the table `ProcedureRenouvellement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_demande` to the `ProcedureRenouvellement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProcedureRenouvellement" DROP CONSTRAINT "ProcedureRenouvellement_id_proc_fkey";

-- DropIndex
DROP INDEX "ProcedureRenouvellement_id_proc_key";

-- AlterTable
ALTER TABLE "ProcedureRenouvellement" DROP COLUMN "id_proc",
ADD COLUMN     "id_demande" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureRenouvellement_id_demande_key" ON "ProcedureRenouvellement"("id_demande");

-- AddForeignKey
ALTER TABLE "ProcedureRenouvellement" ADD CONSTRAINT "ProcedureRenouvellement_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;
