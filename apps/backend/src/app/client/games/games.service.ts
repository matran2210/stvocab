import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePlayTurn, User, Vocabulary } from '@stvocab/database';
import { In, Repository } from 'typeorm';
import { getGameTypeConfig } from './game-types';

const FLIP_CARD_GAME = 'FLIP_CARD';
const FLIP_CARD_REWARD_GOLD = 1000;
const FLIP_CARD_GRID_SIZE = 4;
const FLIP_CARD_PAIR_COUNT = 4;
const FLIP_CARD_TOTAL_CARD_COUNT = FLIP_CARD_PAIR_COUNT * 2;
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

@Injectable()
export class ClientGamesService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GamePlayTurn)
    private readonly gamePlayTurnRepository: Repository<GamePlayTurn>
  ) {}

  async startFlipCardGame(userId: string) {
    const gameConfig = getGameTypeConfig(FLIP_CARD_GAME);

    if (!gameConfig) {
      throw new BadRequestException('Game không tồn tại');
    }

    const currentDate = this.getCurrentVietnamDate();
    let dailyTurn = await this.gamePlayTurnRepository.findOneBy({
      user_id: userId,
      game_type: gameConfig.name,
      date: currentDate,
    });

    if (!dailyTurn) {
      dailyTurn = this.gamePlayTurnRepository.create({
        user_id: userId,
        game_type: gameConfig.name,
        date: currentDate,
        turn_number: 0,
        limit: gameConfig.limit,
      });
    }

    if (dailyTurn.turn_number >= dailyTurn.limit) {
      return {
        gameType: gameConfig.name,
        canPlay: false,
        rewardGold: FLIP_CARD_REWARD_GOLD,
        message: 'Bạn đã dùng hết lượt chơi hôm nay',
        playStatus: this.toPlayStatus(dailyTurn),
        board: null,
      };
    }

    const vocabularies = await this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select([
        'vocabulary.id',
        'vocabulary.word',
        'vocabulary.meaning',
        'vocabulary.phonetic',
      ])
      .orderBy('RANDOM()')
      .limit(FLIP_CARD_PAIR_COUNT)
      .getMany();

    if (vocabularies.length < FLIP_CARD_PAIR_COUNT) {
      throw new BadRequestException('Chưa đủ dữ liệu từ vựng để tạo bàn chơi 8 thẻ');
    }

    dailyTurn.turn_number += 1;
    dailyTurn.limit = gameConfig.limit;

    const savedTurn = await this.gamePlayTurnRepository.save(dailyTurn);

    return {
      gameType: gameConfig.name,
      canPlay: true,
      rewardGold: FLIP_CARD_REWARD_GOLD,
      message: 'Tạo bàn chơi thành công',
      playStatus: this.toPlayStatus(savedTurn),
      board: {
        gridSize: FLIP_CARD_GRID_SIZE,
        totalPairs: FLIP_CARD_PAIR_COUNT,
        totalCards: FLIP_CARD_TOTAL_CARD_COUNT,
        cards: this.shuffleCards(
          vocabularies.flatMap((vocabulary) => [
            {
              id: `${vocabulary.id}-word`,
              pairId: vocabulary.id,
              type: 'WORD',
              content: vocabulary.word,
              phonetic: vocabulary.phonetic,
            },
            {
              id: `${vocabulary.id}-meaning`,
              pairId: vocabulary.id,
              type: 'MEANING',
              content: vocabulary.meaning,
              phonetic: null,
            },
          ])
        ),
      },
    };
  }

  async completeFlipCardGame(userId: string, body: any) {
    const pairIds = Array.isArray(body?.matchedPairIds)
      ? body.matchedPairIds.filter((item: unknown) => typeof item === 'string')
      : [];
    const uniquePairIds = Array.from(new Set(pairIds));

    if (uniquePairIds.length !== FLIP_CARD_PAIR_COUNT) {
      throw new BadRequestException('Danh sách cặp thẻ hoàn thành không hợp lệ');
    }

    const matchedVocabularyCount = await this.vocabularyRepository.count({
      where: {
        id: In(uniquePairIds),
      },
    });

    if (matchedVocabularyCount !== FLIP_CARD_PAIR_COUNT) {
      throw new BadRequestException('Dữ liệu hoàn thành màn chơi không hợp lệ');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    user.gold += FLIP_CARD_REWARD_GOLD;
    const savedUser = await this.userRepository.save(user);

    return {
      message: 'Hoàn thành màn chơi và nhận thưởng thành công',
      rewardGold: FLIP_CARD_REWARD_GOLD,
      gold: savedUser.gold,
    };
  }

  private toPlayStatus(dailyTurn: GamePlayTurn) {
    return {
      date: dailyTurn.date,
      turnNumber: dailyTurn.turn_number,
      limit: dailyTurn.limit,
      remainingTurns: Math.max(dailyTurn.limit - dailyTurn.turn_number, 0),
    };
  }

  private shuffleCards<T>(cards: T[]) {
    const clonedCards = [...cards];

    for (let index = clonedCards.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const currentItem = clonedCards[index];
      clonedCards[index] = clonedCards[swapIndex];
      clonedCards[swapIndex] = currentItem;
    }

    return clonedCards;
  }

  private getCurrentVietnamDate() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}
