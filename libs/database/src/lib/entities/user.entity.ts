import { Entity, Column, OneToMany } from 'typeorm';
import { UserInventory } from './user-inventory.entity';
import { LearningLog } from './learning-log.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('users')
export class User extends AbstractEntity<User>  {
  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: false })
  is_onboarded!: boolean; // Cập nhật thành true sau khi user xem xong Guideline

  @Column({ type: 'timestamp', nullable: true })
  trial_expiration: Date;

  @Column({ default: 'Basic' }) // 'Basic' (có ads) hoặc 'Pro' (không ads)
  package_level: string;

  @Column({ default: 0 })
  gold: number; // Vàng (nhận từ bài kiểm tra, mua bằng tiền)

  @Column({ default: 0 })
  learning_points: number; // Điểm học tập (hoàn thành storyline/test)

  @Column({ default: 0 })
  pity_counter: number; // Đếm số lần quay Gacha (đạt 80 -> chắc chắn ra 5 sao)

  @OneToMany(() => UserInventory, inventory => inventory.user)
  inventory: UserInventory[];

  @OneToMany(() => LearningLog, log => log.user)
  learningLogs: LearningLog[];
}