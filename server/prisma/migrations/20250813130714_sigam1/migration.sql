-- AlterTable
ALTER TABLE "procedure_cession" ALTER COLUMN "taux_cession" DROP NOT NULL,
ALTER COLUMN "nature_cession" DROP NOT NULL,
ALTER COLUMN "statut" DROP NOT NULL;
