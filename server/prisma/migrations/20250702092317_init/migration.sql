-- DropForeignKey
ALTER TABLE "Coordonnee" DROP CONSTRAINT "Coordonnee_id_zone_interdite_fkey";

-- AlterTable
ALTER TABLE "Coordonnee" ALTER COLUMN "id_zone_interdite" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Coordonnee" ADD CONSTRAINT "Coordonnee_id_zone_interdite_fkey" FOREIGN KEY ("id_zone_interdite") REFERENCES "ZoneInterdite"("id_zone") ON DELETE SET NULL ON UPDATE CASCADE;
