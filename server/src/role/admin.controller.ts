import { Controller, Post, Body, Get,Delete, Param, Put } from '@nestjs/common';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { UserService } from './user.service';

@Controller('admin')
export class AdminController {
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private userService: UserService
  ) {}

  @Post('role')
  createRole(@Body() body: { name: string }) {
    return this.roleService.createRole(body.name);
  }

  @Post('permission')
  createPermission(@Body() body: { name: string }) {
    return this.permissionService.createPermission(body.name);
  }

  @Post('role/assign-permissions')
  assignPermissions(@Body() body: { roleId: number, permissionIds: number[] }) {
    return this.roleService.assignPermissionsToRole(body.roleId, body.permissionIds);
  }

  @Post('user/assign-role')
  assignRoleToUser(@Body() body: { userId: number, roleId: number }) {
    return this.userService.assignRoleToUser(Number(body.userId),
    Number(body.roleId));
  }

  @Get('roles')
  getRoles() {
    return this.roleService.getAllRoles();
  }

  @Get('permissions')
  getPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @Get('users')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Delete('role/:id')
deleteRole(@Param('id') id: number) {
  return this.roleService.deleteRole(Number(id));
}

// PUT ROLE (update)
@Put('role/:id')
updateRole(@Param('id') id: number, @Body() body: { name: string }) {
  return this.roleService.updateRole(Number(id), body.name);
}

// DELETE PERMISSION
@Delete('permission/:id')
deletePermission(@Param('id') id: number) {
  return this.permissionService.deletePermission(Number(id));
}

// PUT PERMISSION (update)
@Put('permission/:id')
updatePermission(@Param('id') id: number, @Body() body: { name: string }) {
  return this.permissionService.updatePermission(Number(id), body.name);
}
}


