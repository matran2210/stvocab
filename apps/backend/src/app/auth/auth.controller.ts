import { Controller, Post, Body, Headers, UnauthorizedException, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API Check Auth cho các trang Admin
  @UseGuards(BasicAuthGuard)
  @Get('admin/me')
  getAdminMe() {
    return { 
      message: 'Xác thực thành công', 
      role: 'superadmin' 
    };
  }

  // API Login cho Admin (Sử dụng Basic Auth trong Header hoặc Body cho nhanh)
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
}