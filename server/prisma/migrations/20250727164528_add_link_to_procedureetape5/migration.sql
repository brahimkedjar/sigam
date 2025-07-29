-- DropForeignKey
ALTER TABLE "procedure" DROP CONSTRAINT "procedure_id_seance_fkey";

-- AlterTable
ALTER TABLE "procedure" ALTER COLUMN "id_seance" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "procedure" ADD CONSTRAINT "procedure_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE SET NULL ON UPDATE CASCADE;
