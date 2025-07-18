import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@Req() req) {
  if (!req.user) {
    throw new UnauthorizedException('User not authenticated');
  }
  
  console.log('User from JWT:', req.user);
  return {
    user: {
      id: req.user.id, // Use direct property access
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
    },
  };
}

@Get('debug-cookies')
getCookies(@Req() req: Request, @Res() res: Response) {
  console.log('Received cookies:', req.cookies);
  return res.json({
    cookies: req.cookies,
    headers: req.headers
  });
}


  constructor(private readonly authService: AuthService) {}

  @Post('login')
async login(
  @Body() body: { email: string; password: string },
  @Res({ passthrough: true }) res: Response
) {
  console.log('🔵 Received /auth/login:', body);
  const user = await this.authService.validateUser(body.email, body.password);
  const loginData = await this.authService.login(user, res);
  console.log('✅ Sending login response:', loginData);
  return loginData;
}
 
// auth.controller.ts
@Get('debug-headers')
debugHeaders(@Req() req: Request) {
  console.log('Request Headers:', req.headers);
  console.log('Request Cookies:', req.cookies);
  return {
    headers: req.headers,
    cookies: req.cookies
  };
}
  @Post('refresh')
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refresh(token);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

   @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

}
