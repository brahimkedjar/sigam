import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  createGroup(name: string, description?: string) {
    return this.prisma.group.create({ 
      data: { name, description } 
    });
  }

  async assignPermissionsToGroup(groupId: number, permissionIds: number[]) {
    await this.prisma.groupPermission.deleteMany({
      where: { groupId: Number(groupId) },
    });

    const data = permissionIds.map((permissionId) => ({
      groupId: Number(groupId),
      permissionId: Number(permissionId),
    }));

    return this.prisma.groupPermission.createMany({ data });
  }

  async assignUserToMultipleGroups(userId: number, groupIds: number[]) {
  // Clear existing
  await this.prisma.userGroup.deleteMany({
    where: { userId }
  });

  // Reassign
  const data = groupIds.map(groupId => ({
    userId: Number(userId),
    groupId: Number(groupId),
  }));

  return this.prisma.userGroup.createMany({ data });
}


  async deleteGroup(id: number) {
    // First delete all related UserGroup records
    await this.prisma.userGroup.deleteMany({
      where: { groupId: id },
    });

    // Then delete all related GroupPermission records
    await this.prisma.groupPermission.deleteMany({
      where: { groupId: id },
    });

    // Finally delete the group itself
    return this.prisma.group.delete({
      where: { id },
    });
  }

  updateGroup(id: number, name: string, description?: string) {
    return this.prisma.group.update({ 
      where: { id }, 
      data: { name, description } 
    });
  }

  getAllGroups() {
    return this.prisma.group.findMany({
      include: {
        groupPermissions: {
          include: {
            permission: true,
          }
        },
        userGroups: {
          include: {
            user: true
          }
        }
      }
    });
  }

  assignUserToGroup(userId: number, groupId: number) {
    return this.prisma.userGroup.create({
      data: {
        userId: Number(userId),
        groupId: Number(groupId)
      }
    });
  }

  // Add this method if you need to remove a user from a group
  removeUserFromGroup(userId: number, groupId: number) {
    return this.prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId: Number(userId),
          groupId: Number(groupId)
        }
      }
    });
  }
}