import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  createPermission(name: string) {
    return this.prisma.permission.create({ data: { name } });
  }

  getAllPermissions() {
    return this.prisma.permission.findMany();
  }

  deletePermission(id: number) {
  return this.prisma.permission.delete({ where: { id } });
}

updatePermission(id: number, name: string) {
  return this.prisma.permission.update({ where: { id }, data: { name } });
}

}
