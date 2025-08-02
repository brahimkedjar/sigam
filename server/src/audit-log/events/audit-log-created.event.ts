export interface AuditLogUser {
  id: number;
  username: string;
  email: string;
}

export class AuditLogCreatedEvent {
  constructor(
    public readonly auditLog: {
      id: number;
      action: string;
      entityType: string;
      entityId?: number;
      userId?: number;
      user?: AuditLogUser | null; // Allow null here
      timestamp: Date;
    }
  ) {}
}