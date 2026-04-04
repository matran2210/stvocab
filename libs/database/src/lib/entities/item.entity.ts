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
  type: string; // 'AvatarFrame', 'Ticket', 'MysteryItem', 'Consumable'

  @Column({ default: 4 })
  rarity_star: number; // 4 sao, 5 sao...

  @Column({ default: 0 })
  price_gold: number; // Giá bán bằng vàng trong Shop

  @Column({ nullable: true })
  image_url: string; // Link đến file ảnh icon, khung viền, avatar...

  @Column({ default: true })
  is_stackable: boolean; // True: Vé, Vật phẩm tiêu hao. False: Khung Avatar (chỉ mua 1 lần)

  @Column({ default: true })
  is_active: boolean; // Dùng để Admin ẩn/hiện item khỏi Shop/Gacha

  // Metadata dùng để chứa các cấu hình đặc thù của từng loại item
  // Ví dụ với AvatarFrame: { "css_class": "glow-effect", "border_color": "#FFD700" }
  // Ví dụ với Gacha Ticket: { "adds_spin": 1 }
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; 

  @OneToMany(() => UserInventory, inventory => inventory.item)
  inventories: UserInventory[];
}