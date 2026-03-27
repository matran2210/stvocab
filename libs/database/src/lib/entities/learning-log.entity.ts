import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('learning_logs')
export class LearningLog extends AbstractEntity<LearningLog>   {

  @ManyToOne(() => User, user => user.learningLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary, vocab => vocab.learningLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @Column()
  is_correct: boolean; // Đúng/Sai
}