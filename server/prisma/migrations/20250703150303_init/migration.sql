-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "id_commune" INTEGER,
ADD COLUMN     "id_daira" INTEGER,
ADD COLUMN     "id_wilaya" INTEGER,
ADD COLUMN     "lieu_dit_ar" TEXT;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_wilaya_fkey" FOREIGN KEY ("id_wilaya") REFERENCES "Wilaya"("id_wilaya") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_daira_fkey" FOREIGN KEY ("id_daira") REFERENCES "Daira"("id_daira") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_commune_fkey" FOREIGN KEY ("id_commune") REFERENCES "Commune"("id_commune") ON DELETE SET NULL ON UPDATE CASCADE;
