import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSourceOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSourceOptions,
      autoLoadEntities: true, // Tự động load các entity được đăng ký ở forFeature()
    }),
  ],
})
export class DatabaseModule {}