import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@stvocab/database';
import { Repository, Not } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserData: any) {
    // Tương tự edit, bạn cũng có thể thêm check trùng email/username khi tạo mới ở đây
    if (createUserData.email) {
      const exist = await this.usersRepository.findOneBy({ email: createUserData.email });
      if (exist) throw new ConflictException('Email đã được sử dụng');
    }
    const newUser = this.usersRepository.create(createUserData);
    return await this.usersRepository.save(newUser);
  }

  // Thêm logic phân trang
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.usersRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { created_at: 'DESC' } // Sắp xếp mới nhất lên đầu
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async update(id: string, updateUserData: any) {
    // 1. Kiểm tra user có tồn tại không
    await this.findOne(id); 

    // 2. Check trùng Email (nếu có gửi lên email mới)
    if (updateUserData.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserData.email, id: Not(id) },
      });
      if (existingEmail) {
        throw new ConflictException('Email này đã được sử dụng bởi người dùng khác');
      }
    }

    // 4. Tiến hành update
    await this.usersRepository.update(id, updateUserData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user); 
    return { message: 'Đã xóa người dùng thành công' };
  }
}