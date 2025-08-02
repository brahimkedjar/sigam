/*
  Warnings:

  - You are about to drop the column `parentLogId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_parentLogId_fkey";

-- DropIndex
DROP INDEX "AuditLog_version_idx";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "parentLogId",
DROP COLUMN "version",
ADD COLUMN     "contextId" TEXT,
ADD COLUMN     "previousState" JSONB,
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'SUCCESS';

-- CreateIndex
CREATE INDEX "AuditLog_contextId_idx" ON "AuditLog"("contextId");

-- CreateIndex
CREATE INDEX "AuditLog_sessionId_idx" ON "AuditLog"("sessionId");
