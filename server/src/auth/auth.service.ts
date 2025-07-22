import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express'; // 👈 make sure this is here

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string) {
  const user = await this.prisma.user.findUnique({
  where: { email },
  include: {
    role: {
      include: {
        rolePermissions: {
          include: { permission: true }, // ✅ this is the key
        },
      },
    },
  },
});

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedException('Invalid credentials');
  }

  return user;
}



 async login(user: any, res?: Response) {
  const permissions = user.role?.rolePermissions?.map((rp) => rp.permission.name) || [];

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role.name,
    permissions,
  };

  const token = this.jwtService.sign(payload, { expiresIn: '24h' });

  const userData = {
    id: user.id,
    email: user.email,
    role: user.role.name,
    permissions,
  };

  if (res) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });
  }

  return {
    user: userData,
    token,
  };
}

  async refresh(token: string) {
  try {
    const decoded = await this.jwtService.verifyAsync(token);
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });

    if (!user) throw new UnauthorizedException();

    return this.login(user); // ✅ now valid
  } catch (e) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}

  async register(body: { email: string; password: string; role: string }) {
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
    },
  });

  return { message: 'User registered', userId: user.id };
}



}