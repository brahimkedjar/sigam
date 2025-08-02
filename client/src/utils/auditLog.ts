// utils/auditLog.ts
import axios from 'axios';

interface AuditLogActionParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'LOGIN' | 'LOGOUT' | string;
  entityType: string;
  entityId?: number | string;
  changes?: Record<string, { old?: any; new?: any }>;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  additionalData?: Record<string, any>;
}

export const logAuditAction = async (params: AuditLogActionParams) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const user = JSON.parse(localStorage.getItem('user') || {}; // Adjust based on your auth storage
  
  try {
    const payload = {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: user.id,
      username: user.username,
      changes: params.changes,
      status: params.status,
      errorMessage: params.errorMessage,
      metadata: params.additionalData,
      timestamp: new Date().toISOString()
    };

    await axios.post(`${API_URL}/audit-logs`, payload);
    console.log('Audit log recorded:', payload);
  } catch (error) {
    console.error('Failed to record audit log:', error);
    // Consider fallback logging mechanism here
  }
};