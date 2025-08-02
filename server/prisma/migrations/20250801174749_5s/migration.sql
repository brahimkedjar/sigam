-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "parentLogId" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "AuditLog_version_idx" ON "AuditLog"("version");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_parentLogId_fkey" FOREIGN KEY ("parentLogId") REFERENCES "AuditLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
