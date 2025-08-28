/*
  Warnings:

  - You are about to drop the column `id_pays` on the `demande` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "demande" DROP CONSTRAINT "demande_id_pays_fkey";

-- AlterTable
ALTER TABLE "demande" DROP COLUMN "id_pays";
