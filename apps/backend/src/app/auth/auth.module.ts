import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@stvocab/database';
import { UserAccessTokenGuard } from './guards/user-access-token.guard';
import { ACCESS_TOKEN_SECRET } from './auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: ACCESS_TOKEN_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserAccessTokenGuard],
  exports: [AuthService, UserAccessTokenGuard],
})
export class AuthModule {}
