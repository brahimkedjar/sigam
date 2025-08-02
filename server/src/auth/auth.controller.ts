// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Request, Response } from 'express';// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

@Post('login')
async login(
  @Body() body: { email: string; password: string },
  @Res({ passthrough: true }) res: Response
) {
  const user = await this.authService.validateUser(body.email, body.password);
  const { token, user: userData } = await this.authService.login(user);

  // Set cookie with root path
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/', // Changed from '/permis_dashboard/PermisDashboard' to '/'
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
  });

  return { 
    token, // For local storage
    user: userData 
  };
}

@Post('logout')
async logout(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  const token = req.cookies?.auth_token;
  if (token) {
    await this.authService.logout(token);
  }
  
  // Clear the cookie
  res.clearCookie('auth_token', {
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
  });
  
  return { message: 'Logged out successfully' };
}

 @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  
@Post('verify')
async verify(@Body() body: { token: string }) {
  return {
    user: await this.authService.verifyToken(body.token),
  };
}

}