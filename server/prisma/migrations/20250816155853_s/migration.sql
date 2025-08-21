-- AlterTable
ALTER TABLE "permis_templates" ADD COLUMN     "permisId" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "permis_history" (
    "id" SERIAL NOT NULL,
    "permisId" INTEGER NOT NULL,
    "elements" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "permis_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permis_templates" ADD CONSTRAINT "permis_templates_permisId_fkey" FOREIGN KEY ("permisId") REFERENCES "permis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permis_history" ADD CONSTRAINT "permis_history_permisId_fkey" FOREIGN KEY ("permisId") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
