import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePlayTurn, User, Vocabulary } from '@stvocab/database';
import { AuthModule } from '../../auth/auth.module';
import { ClientGamesController } from './games.controller';
import { ClientGamesService } from './games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary, User, GamePlayTurn]), AuthModule],
  controllers: [ClientGamesController],
  providers: [ClientGamesService],
})
export class ClientGamesModule {}
