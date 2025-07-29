/*
  Warnings:

  - A unique constraint covering the columns `[id_seance,id_procedure]` on the table `ComiteDirection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_procedure` to the `ComiteDirection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "procedure" DROP CONSTRAINT "procedure_id_seance_fkey";

-- DropIndex
DROP INDEX "ComiteDirection_id_seance_numero_decision_key";

-- AlterTable
ALTER TABLE "ComiteDirection" ADD COLUMN     "id_procedure" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ComiteDirection_id_seance_id_procedure_key" ON "ComiteDirection"("id_seance", "id_procedure");

-- AddForeignKey
ALTER TABLE "ComiteDirection" ADD CONSTRAINT "ComiteDirection_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;
