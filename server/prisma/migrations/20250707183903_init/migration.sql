/*
  Warnings:

  - Added the required column `id_demande` to the `cahiercharge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cahiercharge" ADD COLUMN     "id_demande" INTEGER NOT NULL;
