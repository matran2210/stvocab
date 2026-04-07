import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@stvocab/database';
import { AuthModule } from '../../auth/auth.module';
import { ClientCategoryController } from './category.controller';
import { ClientCategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthModule],
  controllers: [ClientCategoryController],
  providers: [ClientCategoryService],
})
export class ClientCategoryModule {}
