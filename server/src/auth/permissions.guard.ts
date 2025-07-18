// permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      console.log('❌ No user or permissions');
      throw new ForbiddenException('User has no permissions');
    }

    console.log('🔐 User permissions:', user.permissions);
    console.log('🔐 Required permissions:', requiredPermissions);

    const hasPermission = requiredPermissions?.every((p) =>
      user.permissions.includes(p)
    );

    if (!hasPermission) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
