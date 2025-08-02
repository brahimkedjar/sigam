// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const session = await this.sessionService.createSession(user.id);
    
    return {
      token: session.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.rolePermissions.map(rp => rp.permission.name),
      },
    };
  }

  async verifyToken(token: string) {
    const session = await this.sessionService.validateSession(token);
    if (!session) return null;

    return {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role!.name,
      permissions: session.user.role!.rolePermissions.map(rp => rp.permission.name),
    };
  }

  async logout(token: string) {
    return this.sessionService.deleteSession(token);
  }

  async register(body: { email: string; password: string; role: string; nom?: string; Prenom?: string; username?: string }) {
  const hashed = await bcrypt.hash(body.password, 10);

  const existingRole = await this.prisma.role.findUnique({
    where: { name: body.role },
  });

  if (!existingRole) {
    throw new Error(`Role "${body.role}" does not exist`);
  }

  const user = await this.prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
      roleId: existingRole.id, // ✅ CORRECT way
      nom: body.nom || '', // Provide default or get from body
      Prenom: body.Prenom || '', // Provide default or get from body
      username: body.username || body.email, // Use email as username if not provided
    },
  });

  return { message: 'User registered', userId: user.id };
}

}