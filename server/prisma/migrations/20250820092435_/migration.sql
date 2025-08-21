/*
  Warnings:

  - You are about to drop the column `id_typeproc` on the `Procedure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Procedure_id_typeproc_fkey";

-- AlterTable
ALTER TABLE "Procedure" DROP COLUMN "id_typeproc";

-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "id_typeproc" INTEGER;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "typeprocedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
