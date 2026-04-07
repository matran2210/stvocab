import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@stvocab/database';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}


  // 2. Dành cho Admin (Kiểm tra trực tiếp từ ENV, không dùng JWT)
  async loginAdmin(user: string, pass: string) {
    const adminUser = process.env.SUPERADMIN_USER;
    const adminPass = process.env.SUPERADMIN_PASSWORD;

    if (user === adminUser && pass === adminPass) {
      // Trả về message thành công, Frontend tự hiểu và lưu base64(user:pass) lại
      return {
        message: 'Đăng nhập Admin thành công',
        role: 'admin',
      };
    }

    throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu Admin');
  }
}
