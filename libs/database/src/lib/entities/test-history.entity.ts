import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('test_histories')
export class TestHistory extends AbstractEntity<TestHistory> {

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ default: 0 })
  score!: number;

  @Column({ default: 0 })
  number_attempt!: number; // Số lượt làm được trong ngày (để tính giới hạn 3000 vàng/ngày)
}