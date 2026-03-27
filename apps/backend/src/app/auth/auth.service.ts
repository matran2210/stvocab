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

  // 1. Dành cho Client (Trang người dùng)
  async loginClient(email: string) {
    let user = await this.userRepository.findOne({ where: { email } });

    // Nếu chưa có user thì tạo mới luôn (Fast Onboarding)
    if (!user) {
      user = this.userRepository.create({
        email,
        username: email.split('@')[0],
        gold: 0,
        learning_points: 0,
        is_onboarded: false,
      });
      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, email: user.email, role: 'user' };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

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
