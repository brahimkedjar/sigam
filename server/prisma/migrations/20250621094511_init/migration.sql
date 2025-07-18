/*
  Warnings:

  - Added the required column `rc` to the `RegistreCommerce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegistreCommerce" ADD COLUMN     "rc" TEXT NOT NULL;
