import { SetMetadata } from '@nestjs/common';

export interface AuditLogMetadata {
  skip?: boolean;
  entityType?: string;
  action?: string;
  readAction?: string;
  contextId?: string;
  allowAnonymous?: boolean;
}

export const AUDIT_LOG_METADATA = 'audit-log';

export const AuditLog = (metadata: AuditLogMetadata) => 
  SetMetadata(AUDIT_LOG_METADATA, metadata);