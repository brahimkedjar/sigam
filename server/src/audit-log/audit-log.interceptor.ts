import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { Reflector } from '@nestjs/core';
import { AuditLogMetadata } from './decorators/audit-log.decorator';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body, params, cookies } = request;

    // Get metadata from decorator if present
    const auditLogMetadata = this.reflector.get<AuditLogMetadata>(
      'audit-log',
      context.getHandler(),
    );

    // Get user from session
    let userId: number | null = null;
    const token = cookies?.auth_token;
    if (token) {
      const session = await this.sessionService.validateSession(token);
      userId = session?.userId ?? null;
    }

    // Skip if marked to skip or if no user (unless explicitly allowed)
    if (auditLogMetadata?.skip || (!userId && !auditLogMetadata?.allowAnonymous)) {
      return next.handle();
    }

    const actionMap = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
      GET: auditLogMetadata?.readAction || 'READ',
    };

    const action = auditLogMetadata?.action || actionMap[method] || method;

    // Get entity ID from params or body
    let entityId: number | undefined;
    if (params.id) {
      entityId = Number(params.id);
    } else if (body.id) {
      entityId = Number(body.id);
    }

    // Get previous state for UPDATE/DELETE actions
    let previousState: any = null;
    if (['UPDATE', 'DELETE'].includes(action) && entityId) {
      previousState = { id: entityId }; // Simplified - fetch actual data in production
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.auditLogService.log({
            action,
            entityType: this.getEntityType(originalUrl, auditLogMetadata?.entityType),
            entityId,
            userId,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            changes: this.getChanges(request, response, action),
            previousState,
            contextId: auditLogMetadata?.contextId,
            sessionId: token,
          }).catch(err => console.error('Audit log error:', err));
        },
        error: (error) => {
          this.auditLogService.log({
            action,
            entityType: this.getEntityType(originalUrl, auditLogMetadata?.entityType),
            entityId,
            userId,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            changes: this.getChanges(request, null, action),
            status: 'FAILURE',
            errorMessage: error.message,
            previousState,
            contextId: auditLogMetadata?.contextId,
            sessionId: token,
          }).catch(err => console.error('Audit log error:', err));
        },
      }),
    );
  }

  private getEntityType(url: string, explicitType?: string): string {
    if (explicitType) return explicitType;
    
    const parts = url.split('/').filter(Boolean);
    return parts.length > 1 ? parts[1] : 'Unknown';
  }

  private getChanges(request: any, response: any, action: string): Record<string, any> | undefined {
    if (action === 'READ') return undefined;

    const changes: Record<string, any> = {};
    const { body, method } = request;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      Object.keys(body).forEach(key => {
        if (key !== 'password' && key !== 'token') {
          changes[key] = { new: body[key] };
        }
      });
    }

    if (response && action === 'UPDATE') {
      Object.keys(response).forEach(key => {
        if (changes[key] && changes[key].new !== response[key]) {
          changes[key].old = response[key];
        }
      });
    }

    return Object.keys(changes).length > 0 ? changes : undefined;
  }
}