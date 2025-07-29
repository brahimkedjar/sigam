// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // ✅ Correct import

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          // First try cookies, then Authorization header
          const token = req?.cookies?.token;
          if (!token) {
            const authHeader = req.headers.authorization || '';
            return authHeader.replace('Bearer ', '');
          }
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true // Enable request access in validate
    });
  }

  async validate(req: Request, payload: any) {
    return { 
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions
    };
  }
}