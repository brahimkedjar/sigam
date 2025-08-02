// src/types/audit.ts
export interface AuditLogPayload {
  action: string;
  entityType: string;
  entityId?: number;
  userId?: number;
  changes?: Record<string, { old?: any; new?: any }> | Record<string, any>;
  status?: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  additionalData?: Record<string, any>;
  previousState?: any;
  contextId?: string;
  sessionId?: string;
}