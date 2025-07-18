-- DropForeignKey
ALTER TABLE "demande" DROP CONSTRAINT "demande_id_expert_fkey";

-- AlterTable
ALTER TABLE "demande" ALTER COLUMN "id_expert" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_expert_fkey" FOREIGN KEY ("id_expert") REFERENCES "expertminier"("id_expert") ON DELETE SET NULL ON UPDATE CASCADE;
