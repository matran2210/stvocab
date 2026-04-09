import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abtract.entity';
import { User } from './user.entity';

@Entity('game_play_turns')
@Index('IDX_GAME_PLAY_TURN_USER_GAME_DATE', ['user_id', 'game_type', 'date'], {
  unique: true,
})
export class GamePlayTurn extends AbstractEntity<GamePlayTurn> {
  @Column()
  user_id: string;

  @Column()
  game_type: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: 0 })
  turn_number: number;

  @Column({ default: 3 })
  limit: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
