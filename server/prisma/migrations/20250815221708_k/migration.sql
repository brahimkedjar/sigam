-- DropIndex
DROP INDEX "statutjuridique_id_statutJuridique_key";

-- AlterTable
CREATE SEQUENCE statutjuridique_id_statutjuridique_seq;
ALTER TABLE "statutjuridique" ALTER COLUMN "id_statutJuridique" SET DEFAULT nextval('statutjuridique_id_statutjuridique_seq');
ALTER SEQUENCE statutjuridique_id_statutjuridique_seq OWNED BY "statutjuridique"."id_statutJuridique";
