/*
  Warnings:

  - You are about to drop the `TypeDoc` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_id_typedoc_fkey";

-- DropTable
DROP TABLE "TypeDoc";
