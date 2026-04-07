import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '@stvocab/database';
import { Repository } from 'typeorm';

@Injectable()
export class ClientCategoryService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
