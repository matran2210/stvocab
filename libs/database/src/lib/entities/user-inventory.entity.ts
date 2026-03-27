import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('user_inventory')
export class UserInventory extends AbstractEntity<UserInventory>  {

  @ManyToOne(() => User, user => user.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Item, item => item.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ default: 1 })
  quantity: number;

  @CreateDateColumn()
  acquired_at: Date;
}