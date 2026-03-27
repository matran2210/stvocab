import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('chat_messages')
export class ChatMessage extends AbstractEntity<ChatMessage> {

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  message: string;
}