import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Thiếu hoặc sai định dạng Authorization header');
    }

    const b64auth = (authHeader || '').split(' ')[1] || '';
    const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (username === process.env.SUPERADMIN_USER && password === process.env.SUPERADMIN_PASSWORD) {
      return true;
    }

    throw new UnauthorizedException('Sai thông tin đăng nhập Superadmin');
  }
}