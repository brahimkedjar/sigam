import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);
  private readonly excludedRoutes = ['/audit-logs/log'];
  private readonly excludedPaths = [
    '/auth/refresh',
    '/auth/login',
    '/_next/',
    '/favicon.ico',
    '/health',
    '/audit-logs/revert'
  ]; // Keep manual logging endpoint

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body, params } = request;

    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }

    // Skip excluded routes and GET requests unless they modify data
    if (this.excludedRoutes.includes(originalUrl) || (method === 'GET' && !originalUrl.includes('/export'))) {
      return next.handle();
    }

    const entityType = this.getEntityType(context, originalUrl);
    const entityId = params.id ? Number(params.id) : body?.id ? Number(body.id) : undefined;
    
    let previousState: Record<string, any> | null = null;
    let changes: Record<string, { old?: any; new: any }> = {};

    // For UPDATE/DELETE, get current state before the operation
    if (['PUT', 'PATCH', 'DELETE'].includes(method) && entityId) {
      try {
        previousState = await this.getPreviousState(entityType, entityId.toString());
        if (method === 'DELETE') {
          // For DELETE, capture all fields from previous state as changes
          if (previousState) {
            Object.keys(previousState).forEach(key => {
              if (!['password', 'token'].includes(key)) {
                changes[key] = { old: previousState![key], new: null };
              }
            });
          }
        } else {
          // For UPDATE, capture changed fields from request body
          changes = this.getChanges(body, null, method) || {};
        }
      } catch (error) {
        this.logger.error(`Error getting previous state: ${error.message}`);
      }
    }

    // For CREATE, prepare empty changes to be filled from response
    if (method === 'POST') {
      changes = this.getChanges(body, null, method) || {};
    }

    return next.handle().pipe(
      tap({
        next: async (response) => {
          // For CREATE, get ID from response if not in request
          const finalEntityId = entityId || response?.id || 
                              (response?.data?.id ? Number(response.data.id) : undefined);

          // For UPDATE, merge changes with response
          if (['PUT', 'PATCH'].includes(method)) {
            const updatedChanges = this.getChanges(body, response, method);
            if (updatedChanges) {
              changes = updatedChanges;
            }
          }

          // For CREATE, capture all response fields
          if (method === 'POST' && response) {
            changes = this.getCreateChanges(body, response);
          }

          await this.logAction({
            request,
            action: this.getAction(method),
            entityType,
            entityId: finalEntityId,
            changes,
            previousState,
            status: 'SUCCESS',
            response
          });
        },
        error: async (error) => {
          await this.logAction({
            request,
            action: this.getAction(method),
            entityType,
            entityId,
            changes,
            previousState,
            status: 'FAILURE',
            error
          });
        },
      }),
    );
  }

 private async logAction({
  request,
  action,
  entityType,
  entityId,
  changes,
  previousState,
  status,
  error,
  response
}: {
  request: any;
  action: string;
  entityType: string;
  entityId?: number;
  changes: Record<string, { old?: any; new: any }>;
  previousState?: Record<string, any> | null;
  status: 'SUCCESS' | 'FAILURE';
  error?: any;
  response?: any;
}) {
  // Get user from headers if not in request.user
 const userId = request.user?.id || 
                request.headers['x-user-id'] ||
                request.user?.sub || 
                (request.session?.userId ? Number(request.session.userId) : null);
  
  // Get username from multiple possible sources
  const userName = request.user?.username ||
                  request.headers['x-user-name'] ||
                  request.user?.name ||
                  request.user?.email ||
                  (userId ? `User-${userId}` : 'System');

  // Debug logging to verify user extraction
  this.logger.debug(`Extracted user - ID: ${userId}, Name: ${userName}`);

  // For DELETE actions, use the response as previousState
  if (action === 'DELETE' && response) {
    previousState = response;
  }

  // For UPDATE actions, use the _old property from response if available
  if (action === 'UPDATE' && response?._old) {
    previousState = response._old;
    delete response._old; // Remove the temporary property
  }

  try {
    await this.auditLogService.log({
      action,
      entityType,
      entityId: entityId !== undefined ? entityId : null,
      userId: userId ? Number(userId) : null,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      changes: Object.keys(changes).length > 0 ? changes : null,
      previousState,
      status,
      errorMessage: error?.message,
      additionalData: {
        endpoint: request.originalUrl,
        method: request.method,
        userName,
        ...(response ? { responseData: response } : {})
      },
    });
  } catch (err) {
    this.logger.error('Failed to log audit action', err);
  }
}

 private getCreateChanges(requestBody: any, response: any): Record<string, { new: any }> {
    const changes: Record<string, { new: any }> = {};
    
    // Include all response fields except sensitive ones
    Object.keys(response).forEach(key => {
      if (!['password', 'token', 'refreshToken'].includes(key)) {
        changes[key] = { new: response[key] };
      }
    });

    // Include request body fields that might not be in response
    Object.keys(requestBody || {}).forEach(key => {
      if (!changes[key] && !['password', 'token'].includes(key)) {
        changes[key] = { new: requestBody[key] };
      }
    });

    return changes;
  }

  

  private getAction(method: string): string {
    const actionMap = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || method;
  }

  private async getPreviousState(entityType: string, entityId: string) {
  try {
    const numericId = Number(entityId);
    if (isNaN(numericId)) return null;
    
    const model = this.prisma[entityType.toLowerCase()];
    if (model?.findUnique) {
      return await model.findUnique({ where: { id: numericId } });
    }
  } catch (error) {
    this.logger.warn(`Could not fetch previous state for ${entityType}:${entityId}`);
  }
  return null;
}

  private getEntityType(context: ExecutionContext, url: string): string {
  // First try to get from metadata (you can add this to your controllers)
  const auditLogMetadata = this.reflector.get<{ entityType?: string }>(
    'audit-log',
    context.getHandler(),
  );
  
  if (auditLogMetadata?.entityType) {
    return auditLogMetadata.entityType;
  }

  // Then try controller name
  const controllerName = context.getClass().name;
  if (controllerName.endsWith('Controller')) {
    return controllerName.replace('Controller', '');
  }

  // Finally parse from URL
  const parts = url.split('/').filter(Boolean);
  
  // Special handling for admin routes
  if (parts[0] === 'admin' && parts.length > 1) {
    return parts[1]; // Returns 'role' for '/admin/role/:id'
  }
  
  return parts.length > 1 ? parts[1] : 'Unknown';
}

  private getChanges(
  requestBody: any, 
  response: any, 
  method: string
): Record<string, { old?: any; new: any }> | undefined {
  const changes: Record<string, { old?: any; new: any }> = {};
  const safeBody = requestBody || {};

  // Always include the ID if available
  if (safeBody.id) {
    changes.id = { new: safeBody.id };
  }

  // For DELETE actions, capture all fields from response
  if (method === 'DELETE' && response) {
    Object.keys(response).forEach(key => {
      if (!['password', 'token', 'refreshToken'].includes(key)) {
        changes[key] = { old: response[key], new: null };
      }
    });
    return Object.keys(changes).length > 0 ? changes : undefined;
  }

  // For other methods, capture all request body fields
  Object.keys(safeBody).forEach(key => {
    if (!['password', 'token', 'refreshToken'].includes(key)) {
      changes[key] = { new: safeBody[key] };
    }
  });

  // For UPDATE actions, get old values from response._old
  if (response && ['PUT', 'PATCH'].includes(method)) {
    const oldData = response._old || {};
    Object.keys(changes).forEach(key => {
      if (oldData[key] !== undefined) {
        changes[key] = {
          old: oldData[key],
          new: changes[key].new
        };
      }
    });
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}
  private shouldSkipLogging(request: Request): boolean | undefined {
  // Skip auth-related requests
  if (request.url.includes('/auth/')) {
    return true;
  }}
}