-- AlterTable
ALTER TABLE "ProcedureRenouvellement" ALTER COLUMN "date_decision" DROP NOT NULL,
ALTER COLUMN "date_debut_validite" DROP NOT NULL,
ALTER COLUMN "date_fin_validite" DROP NOT NULL;
