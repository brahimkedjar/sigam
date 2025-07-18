-- DropForeignKey
ALTER TABLE "cahiercharge" DROP CONSTRAINT "cahiercharge_demandeId_fkey";

-- AlterTable
ALTER TABLE "cahiercharge" ALTER COLUMN "demandeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cahiercharge" ADD CONSTRAINT "cahiercharge_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demande"("id_demande") ON DELETE SET NULL ON UPDATE CASCADE;
