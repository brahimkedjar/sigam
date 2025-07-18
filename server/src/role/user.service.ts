import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  assignRoleToUser(userId: number | string, roleId: number | string) {
  return this.prisma.user.update({
    where: { id: Number(userId) },
    data: { roleId: Number(roleId) }
  });
}


  // user.service.ts
async getAllUsers() {
  const users = await this.prisma.user.findMany({
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            }
          }
        }
      }
    }
  });

  // Map nested rolePermissions to a flat permissions array
  return users.map(user => ({
    ...user,
    role: user.role
      ? {
          ...user.role,
          permissions: user.role.rolePermissions.map(rp => rp.permission)
        }
      : null
  }));
}

}
