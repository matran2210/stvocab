import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '@stvocab/database';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  create(data: any) {
    const category = this.repo.create(data as Category);
    return this.repo.save(category);
  }

async findAll(query: any) {
    // 1. Lấy page và limit từ query, nếu không có thì gán mặc định
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    
    // 2. Tính toán số record cần bỏ qua (skip)
    const skip = (page - 1) * limit;

    // 3. Dùng findAndCount để lấy data và tổng số lượng
    const [data, total] = await this.repo.findAndCount({
      skip: skip,
      take: limit,
      order: {
        created_at: 'DESC' // Sắp xếp mới nhất lên đầu
      }
    });

    // 4. Trả về đúng format mà Frontend đang đợi
    return {
      data: data,
      meta: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalItems: total
      }
    };
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async update(id: string, data: any) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.softDelete(id); // Dùng softDelete để giữ lại data theo cột deleted_at
    return { success: true, message: 'Deleted successfully' };
  }
}