import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@stvocab/database';
import { Repository } from 'typeorm';
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { hashSecret, verifySecret } from './password.util';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  type: 'access';
  role: 'user';
};

type RefreshTokenPayload = {
  sub: string;
  email: string;
  type: 'refresh';
  role: 'user';
};

type UserAuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
    packageLevel: string;
    gold: number;
    learningPoints: number;
    isOnboarded: boolean;
  };
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

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

  async registerUser(input: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  }): Promise<UserAuthResponse> {
    const email = this.normalizeEmail(input.email);
    const password = this.validatePassword(input.password);
    const name = input.name?.trim() || null;
    const phone = input.phone?.trim() || null;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const user = this.userRepository.create({
      email,
      name,
      phone,
      password_hash: hashSecret(password),
    });

    const savedUser = await this.userRepository.save(user);
    return this.issueUserSession(savedUser);
  }

  async loginUser(input: {
    email?: string;
    password?: string;
  }): Promise<UserAuthResponse> {
    const email = this.normalizeEmail(input.email);
    const password = this.validatePassword(input.password, false);
    const user = await this.findUserForAuthByEmail(email);

    if (!user?.password_hash || !verifySecret(password, user.password_hash)) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản hiện không khả dụng');
    }

    return this.issueUserSession(user);
  }

  async refreshUserSession(refreshToken?: string): Promise<UserAuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.findUserForAuthById(payload.sub);

    if (!user?.refresh_token_hash || !user.refresh_token_expires_at) {
      throw new UnauthorizedException('Phiên đăng nhập không còn hợp lệ');
    }

    if (user.refresh_token_expires_at.getTime() <= Date.now()) {
      await this.clearRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    if (!verifySecret(refreshToken, user.refresh_token_hash)) {
      await this.clearRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    return this.issueUserSession(user);
  }

  async logoutUser(userId: string): Promise<{ message: string }> {
    await this.clearRefreshToken(userId);
    return { message: 'Đăng xuất thành công' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }

    return this.toSafeUser(user);
  }

  async changeUserPassword(userId: string, newPassword?: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }

    await this.userRepository.update(userId, {
      password_hash: hashSecret(this.validatePassword(newPassword)),
      refresh_token_hash: null,
      refresh_token_expires_at: null,
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken, {
        secret: ACCESS_TOKEN_SECRET,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Sai loại access token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return hashSecret(this.validatePassword(password));
  }

  private async issueUserSession(user: User): Promise<UserAuthResponse> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
      role: 'user',
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      role: 'user',
    };
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        jwtid: refreshTokenId,
      }),
    ]);

    await this.userRepository.update(user.id, {
      refresh_token_hash: hashSecret(refreshToken),
      refresh_token_expires_at: new Date(
        Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000
      ),
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
      user: this.toSafeUser(user),
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Sai loại refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  private async findUserForAuthByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect([
        'user.password_hash',
        'user.refresh_token_hash',
        'user.refresh_token_expires_at',
      ])
      .where('user.email = :email', { email })
      .getOne();
  }

  private async findUserForAuthById(id: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect([
        'user.password_hash',
        'user.refresh_token_hash',
        'user.refresh_token_expires_at',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  private async clearRefreshToken(userId: string) {
    await this.userRepository.update(userId, {
      refresh_token_hash: null,
      refresh_token_expires_at: null,
    });
  }

  private normalizeEmail(email?: string) {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException('Email là bắt buộc');
    }

    return normalizedEmail;
  }

  private validatePassword(password?: string, requireStrong = true) {
    const normalizedPassword = password?.trim();

    if (!normalizedPassword) {
      throw new BadRequestException('Mật khẩu là bắt buộc');
    }

    if (requireStrong && normalizedPassword.length < 8) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');
    }

    return normalizedPassword;
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      phone: user.phone ?? null,
      status: user.status,
      packageLevel: user.package_level,
      gold: user.gold,
      learningPoints: user.learning_points,
      isOnboarded: user.is_onboarded,
    };
  }
}
