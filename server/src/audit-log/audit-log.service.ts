import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogCreatedEvent } from './events/audit-log-created.event';
import { RevertAuditLogDto } from './dto/revert-audit-log.dto';
import { AuditLogVisualizationDto } from './dto/audit-log-visualization.dto';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId?: number | null;
  userId?: number | null;
  ipAddress?: string;
  userAgent?: string;
  changes?: Prisma.JsonValue | null;
  status?: 'SUCCESS' | 'FAILURE';
  errorMessage?: string | null;
  additionalData?: Prisma.JsonValue | null;
  previousState?: Prisma.JsonValue | null;
  contextId?: string | null;
  sessionId?: string | null;
}

interface GetLogsParams {
  where?: any;
  page: number;
  limit: number;
  orderBy?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AuditLogService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async log(data: AuditLogData): Promise<{ id: number }> {
    try {
      const logInput: Prisma.AuditLogCreateInput = {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? undefined,
        user: data.userId ? { connect: { id: data.userId } } : undefined,
        changes: data.changes ?? undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status || 'SUCCESS',
        errorMessage: data.errorMessage ?? undefined,
        additionalData: data.additionalData ?? undefined,
        previousState: data.previousState ?? undefined,
        contextId: data.contextId ?? undefined,
        sessionId: data.sessionId ?? undefined
      };

      const createdLog = await this.prisma.auditLog.create({
        data: logInput,
        include: { user: true }
      });

      this.eventEmitter.emit(
        'audit-log.created',
        new AuditLogCreatedEvent({
          id: createdLog.id,
          action: createdLog.action,
          entityType: createdLog.entityType,
          entityId: createdLog.entityId ?? undefined,
          userId: createdLog.userId ?? undefined,
          user: createdLog.user ? {
            id: createdLog.user.id,
            username: createdLog.user.username,
            email: createdLog.user.email
          } : undefined,
          timestamp: createdLog.timestamp,
        })
      );

      return { id: createdLog.id };
    } catch (error) {
      console.error('Audit log creation failed:', error);
      throw error;
    }
  }

  async getLogs(params: GetLogsParams): Promise<PaginatedResult<any>> {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: params.where,
        include: { 
          user: { 
            select: { 
              id: true,
              username: true, 
              email: true,
              role: true} 
          } 
        },
        orderBy: { timestamp: params.orderBy || 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.auditLog.count({ where: params.where }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getLogById(id: number) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  async revertLog(revertDto: RevertAuditLogDto) {
  const log = await this.getLogById(revertDto.logId);

  if (!log.previousState) {
    throw new Error('Cannot revert - previous state not available');
  }

  const model = this.prisma[log.entityType.toLowerCase()];
  if (!model) {
    throw new Error(`Entity type ${log.entityType} not supported for revert`);
  }

  await model.update({
    where: { id: log.entityId ?? undefined },
    data: log.previousState as Prisma.InputJsonValue,
  });

  return this.log({
    action: 'REVERT',
    entityType: log.entityType,
    entityId: log.entityId ?? undefined,
    userId: revertDto.userId,
    changes: {
      revertedFrom: log.changes as Prisma.JsonValue,
      revertedTo: log.previousState as Prisma.JsonValue,
    },
    contextId: log.contextId ?? undefined,
    additionalData: {
      originalLogId: log.id,
      revertedBy: revertDto.userId,
      reason: revertDto.reason,
    },
  });
}

 async getVisualizationData(dto: AuditLogVisualizationDto) {
  // Convert entityId to number if it exists
  const entityId = dto.entityId ? Number(dto.entityId) : undefined;

  // Get logs for visualization
  const logs = await this.prisma.auditLog.findMany({
    where: {
      entityType: dto.entityType,
      entityId: entityId, // Now properly typed as number | undefined
      timestamp: {
        gte: dto.startDate,
        lte: dto.endDate,
      },
    },
    orderBy: { timestamp: 'asc' },
    include: { user: { select: { username: true, email: true } } },
  });

  // Process into timeline data
  const timeline = logs.map(log => ({
    id: log.id,
    date: log.timestamp,
    action: log.action,
    user: log.user?.username || 'System',
    changes: log.changes,
  }));

  // Calculate statistics
  const stats = {
    totalActions: logs.length,
    actionsByType: logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {}),
    users: [...new Set(logs.map(log => log.user?.username || 'System'))],
  };

  return { timeline, stats };
}

  async getUserActivity(userId: number, days = 30, limit = 100) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.prisma.auditLog.findMany({
      where: { 
        userId,
        timestamp: { gte: date } 
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { 
        user: { 
          select: { 
            username: true, 
            email: true 
          } 
        } 
      },
    });
  }

  async getEntityHistory(entityType: string, entityId: number) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      include: { user: true },
    });
  }

  async getRecentActivity(limit = 20) {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { user: { select: { username: true, email: true } } },
    });
  }
}