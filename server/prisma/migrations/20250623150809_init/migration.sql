-- CreateEnum
CREATE TYPE "EnumTypeInteraction" AS ENUM ('envoi', 'relance', 'reponse');

-- CreateEnum
CREATE TYPE "EnumAvisWali" AS ENUM ('favorable', 'defavorable');

-- CreateTable
CREATE TABLE "InteractionWali" (
    "id_interaction" SERIAL NOT NULL,
    "id_procedure" INTEGER NOT NULL,
    "type_interaction" "EnumTypeInteraction" NOT NULL,
    "avis_wali" "EnumAvisWali",
    "date_interaction" TIMESTAMP(3) NOT NULL,
    "remarques" TEXT,
    "contenu" TEXT,

    CONSTRAINT "InteractionWali_pkey" PRIMARY KEY ("id_interaction")
);

-- AddForeignKey
ALTER TABLE "InteractionWali" ADD CONSTRAINT "InteractionWali_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;
