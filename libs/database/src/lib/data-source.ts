import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Tải biến môi trường từ file .env ở thư mục gốc
dotenv.config();

const rootPath = process.cwd();

export const AppDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  username: process.env['DB_USERNAME'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'postgres',
  database: process.env['DB_DATABASE'] || 'stvocab',
  // Trong Nx, đường dẫn nên linh hoạt cho cả dev và build
  entities: [join(rootPath, 'libs/database/src/lib/entities/**/*.entity{.ts,.js}')],
    // Tự động quét các file migration
  migrations: [
    join(rootPath, 'libs/database/migrations/**/*{.ts,.js}'),
  ],
  synchronize: false, // Bắt buộc false ở Production, dùng migration để cập nhật DB
  logging: false,
};

const AppDataSource = new DataSource(AppDataSourceOptions);
export default AppDataSource;
