import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, AccessTokenPayload } from '../auth.service';

type AuthenticatedRequest = Request & {
  user?: AccessTokenPayload;
};

@Injectable()
export class UserAccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu Bearer token');
    }

    const accessToken = authHeader.slice('Bearer '.length).trim();
    const payload = await this.authService.verifyAccessToken(accessToken);
    request.user = payload;

    return true;
  }
}
