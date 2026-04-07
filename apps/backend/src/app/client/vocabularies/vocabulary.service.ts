import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vocabulary } from '@stvocab/database';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ClientVocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private repo: Repository<Vocabulary>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const categoryId = query.category_id?.trim();

    const where = categoryId ? { category_id: categoryId } : {};

    const [data, total] = await this.repo.findAndCount({
      where,
      select: {
        id: true,
        word: true,
        phonetic: true,
        meaning: true,
        audio_path: true,
        category_id: true,
      },
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

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        word: true,
        phonetic: true,
        meaning: true,
        audio_path: true,
        image_path: true,
        storyline: true,
        category_id: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Vocabulary not found');
    }

    return item;
  }
}
