// utils/auditLogger.ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuditLogPayload {
  action: string;
  entityType?: string;
  entityId?: number;
  changes?: Record<string, { old?: any; new?: any }>;
  status?: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  additionalData?: Record<string, any>;
}

export const logAuditAction = async (payload: Omit<AuditLogPayload, 'userId'>) => {
  const auth = useAuthStore.getState().auth;
  
  try {
    // Validate payload before sending
    await axios.post(`${API_URL}/audit-logs/log`, {
      ...payload,
      userId: auth?.id ?? null,
      additionalData: {
        ...payload.additionalData,
        clientInfo: {
          role: auth?.role,
          permissions: auth?.permissions
        }
      }
    }, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Audit log failed:', error);
    
    // Fallback to localStorage if API fails
    const failedLogs = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
    failedLogs.push({
      ...payload,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    localStorage.setItem('failedAuditLogs', JSON.stringify(failedLogs));
    
    throw error;
  }
};