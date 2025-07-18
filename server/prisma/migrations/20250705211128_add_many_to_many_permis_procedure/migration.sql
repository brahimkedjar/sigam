/*
  Warnings:

  - You are about to drop the column `id_permis` on the `procedure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "procedure" DROP CONSTRAINT "procedure_id_permis_fkey";

-- AlterTable
ALTER TABLE "procedure" DROP COLUMN "id_permis";

-- CreateTable
CREATE TABLE "_PermisProcedure" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermisProcedure_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PermisProcedure_B_index" ON "_PermisProcedure"("B");

-- AddForeignKey
ALTER TABLE "_PermisProcedure" ADD CONSTRAINT "_PermisProcedure_A_fkey" FOREIGN KEY ("A") REFERENCES "permis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisProcedure" ADD CONSTRAINT "_PermisProcedure_B_fkey" FOREIGN KEY ("B") REFERENCES "procedure"("id_proc") ON DELETE CASCADE ON UPDATE CASCADE;
