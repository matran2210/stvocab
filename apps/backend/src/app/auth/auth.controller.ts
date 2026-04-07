import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { UserAccessTokenGuard } from './guards/user-access-token.guard';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

class UserRegisterDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

class UserLoginDto {
  email?: string;
  password?: string;
}

class UserRefreshDto {
  refreshToken?: string;
}

class UserChangePasswordDto {
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(BasicAuthGuard)
  @Get('admin/me')
  getAdminMe() {
    return {
      message: 'Xác thực thành công',
      role: 'superadmin',
    };
  }

  @Post('admin/login')
  async loginAdmin(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Basic ')) {
      throw new UnauthorizedException('Yêu cầu Basic Auth');
    }

    // Decode Basic Auth (base64)
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [user, pass] = credentials.split(':');

    return this.authService.loginAdmin(user, pass);
  }

  @Post('user/register')
  async registerUser(@Body() body: UserRegisterDto) {
    return this.authService.registerUser(body);
  }

  @Post('user/login')
  async loginUser(@Body() body: UserLoginDto) {
    return this.authService.loginUser(body);
  }

  @Post('user/refresh')
  async refreshUser(@Body() body: UserRefreshDto) {
    return this.authService.refreshUserSession(body.refreshToken);
  }

  @UseGuards(UserAccessTokenGuard)
  @Post('user/logout')
  async logoutUser(@Req() request: AuthenticatedRequest) {
    return this.authService.logoutUser(request.user.sub);
  }

  @UseGuards(UserAccessTokenGuard)
  @Get('user/me')
  async getUserMe(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user.sub);
  }

  @UseGuards(UserAccessTokenGuard)
  @Post('user/change-password')
  async changeUserPassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: UserChangePasswordDto
  ) {
    return this.authService.changeUserPassword(request.user.sub, body.password);
  }
}
