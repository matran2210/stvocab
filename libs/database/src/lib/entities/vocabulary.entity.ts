import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { LearningLog } from './learning-log.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('vocabularies')
export class Vocabulary extends AbstractEntity<Vocabulary> {
  @Column()
  word: string;

  @Column()
  meaning: string;

  @Column()
  phonetic: string;

  @Column()
  level: string; // 'BASIC' hoặc 'ADVANCED'

  @Column({ type: 'text', nullable: true })
  storyline: string; // Nội dung câu chuyện do AI tạo

  @Column({ type: 'text', nullable: true })
  general: string; // Tổng hợp kiến thức nhanh do AI tạo

  @Column({ nullable: true })
  image_path: string; // Lưu đường dẫn ổ cứng chứa ảnh AI tạo

  @Column({ nullable: true })
  audio_path: string; // Lưu đường dẫn audio từ vựng

  @Column({ default: 0 })
  total_attempts: number; // Tổng số lượt làm

  @Column({ default: 0 })
  wrong_attempts: number; // Số lượt sai (Dùng để tính error_rate > 50%)

  @Column()
  category_id: string;

  @ManyToOne(() => Category, (category) => category.vocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => LearningLog, (log) => log.vocabulary)
  learningLogs: LearningLog[];
}
