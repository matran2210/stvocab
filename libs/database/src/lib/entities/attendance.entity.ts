import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('attendances')
export class Attendance extends AbstractEntity<Attendance> {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  checkin_date: string; // Ngày điểm danh

  @Column({ default: false })
  is_x2_reward: boolean; // True nếu người dùng xem quảng cáo

  @Column({ nullable: true })
  reward_type: string; // 'gold', 'item'

}