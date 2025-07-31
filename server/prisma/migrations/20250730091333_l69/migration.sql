/*
  Warnings:

  - You are about to drop the column `duree_renouv_max` on the `typepermis` table. All the data in the column will be lost.
  - Added the required column `duree_renouv` to the `typepermis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbr_renouv_max` to the `typepermis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "typepermis" DROP COLUMN "duree_renouv_max",
ADD COLUMN     "duree_renouv" INTEGER NOT NULL,
ADD COLUMN     "nbr_renouv_max" INTEGER NOT NULL;
