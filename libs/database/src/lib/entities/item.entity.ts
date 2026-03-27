import { Entity, Column, OneToMany } from 'typeorm';
import { UserInventory } from './user-inventory.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('items')
export class Item extends AbstractEntity<Item> {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string; // vd: 'AvatarFrame', 'Ticket', 'MysteryItem'

  @Column({ default: 4 })
  rarity_star: number; // 4 sao (2%), 5 sao (0.005%)

  @Column({ default: 0 })
  price_gold: number; // Giá bán bằng vàng trong Shop

  @OneToMany(() => UserInventory, inventory => inventory.item)
  inventories: UserInventory[];
}