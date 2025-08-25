/*
  Warnings:

  - You are about to drop the `permis_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "permis_history" DROP CONSTRAINT "permis_history_permisId_fkey";

-- DropTable
DROP TABLE "permis_history";
