/*
  Warnings:

  - You are about to drop the column `id_procedure` on the `ComiteDirection` table. All the data in the column will be lost.
  - Added the required column `statut` to the `SeanceCDPrevue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EnumStatutSeance" AS ENUM ('programmee', 'terminee');

-- DropForeignKey
ALTER TABLE "ComiteDirection" DROP CONSTRAINT "ComiteDirection_id_procedure_fkey";

-- DropIndex
DROP INDEX "ComiteDirection_id_seance_id_procedure_key";

-- AlterTable
ALTER TABLE "ComiteDirection" DROP COLUMN "id_procedure";

-- AlterTable
ALTER TABLE "SeanceCDPrevue" ADD COLUMN     "statut" "EnumStatutSeance" NOT NULL;

-- CreateTable
CREATE TABLE "_SeanceProcedures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SeanceProcedures_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SeanceProcedures_B_index" ON "_SeanceProcedures"("B");

-- AddForeignKey
ALTER TABLE "_SeanceProcedures" ADD CONSTRAINT "_SeanceProcedures_A_fkey" FOREIGN KEY ("A") REFERENCES "procedure"("id_proc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeanceProcedures" ADD CONSTRAINT "_SeanceProcedures_B_fkey" FOREIGN KEY ("B") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE CASCADE ON UPDATE CASCADE;
