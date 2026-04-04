import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '@stvocab/database';
import { Repository } from 'typeorm';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  // Bổ sung tham số page và limit
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.itemRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: skip,
      take: limit,
    });

    // Trả về format chuẩn có meta phân trang
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // Dùng trực tiếp Partial<Item> thay vì DTO
  async create(data: Partial<Item>) {
    const newItem = this.itemRepo.create(data);
    return await this.itemRepo.save(newItem);
  }

  async update(id: string, data: Partial<Item>) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Item not found');

    Object.assign(item, data);
    return await this.itemRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Item not found');
    
    await this.itemRepo.softRemove(item);
    return { success: true };
  }
}