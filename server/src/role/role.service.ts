import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  createRole(name: string) {
    return this.prisma.role.create({ data: { name } });
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
  // Optional: Clear existing permissions first
  await this.prisma.rolePermission.deleteMany({
    where: { roleId: Number(roleId) },
  });

  // Insert new permissions
  const data = permissionIds.map((permissionId) => ({
    roleId: Number(roleId),
    permissionId: Number(permissionId),
  }));

  return this.prisma.rolePermission.createMany({ data });
}

async deleteRole(id: number) {
  // Step 1: Remove permissions linked to this role
  await this.prisma.rolePermission.deleteMany({
    where: { roleId: id },
  });

  // Step 2: Nullify role from users
  await this.prisma.user.updateMany({
    where: { roleId: id },
    data: { roleId: null },
  });

  // Step 3: Delete the role
  return this.prisma.role.delete({
    where: { id },
  });
}



updateRole(id: number, name: string) {
  return this.prisma.role.update({ where: { id }, data: { name } });
}


  getAllRoles() {
  return this.prisma.role.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

}
