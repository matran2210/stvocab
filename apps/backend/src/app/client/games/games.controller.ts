import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserAccessTokenGuard } from '../../auth/guards/user-access-token.guard';
import { ClientGamesService } from './games.service';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

@Controller('client/games')
@UseGuards(UserAccessTokenGuard)
export class ClientGamesController {
  constructor(private readonly gamesService: ClientGamesService) {}

  @Get('flip-card')
  startFlipCardGame(@Req() request: AuthenticatedRequest) {
    return this.gamesService.startFlipCardGame(request.user.sub);
  }

  @Post('flip-card/complete')
  completeFlipCardGame(@Req() request: AuthenticatedRequest, @Body() body: any) {
    return this.gamesService.completeFlipCardGame(request.user.sub, body);
  }
}
