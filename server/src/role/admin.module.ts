import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { AdminController } from './admin.controller';


@Module({
  controllers: [AdminController],
  providers: [PermissionService,RoleService, PrismaService,UserService],
})
export class AdminModule {}
