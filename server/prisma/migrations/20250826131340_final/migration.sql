/*
  Warnings:

  - You are about to drop the column `date_demarrage` on the `demande` table. All the data in the column will be lost.
  - Added the required column `date_instruction` to the `demande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "demande" DROP COLUMN "date_demarrage",
ADD COLUMN     "date_instruction" TIMESTAMP(3) NOT NULL;
