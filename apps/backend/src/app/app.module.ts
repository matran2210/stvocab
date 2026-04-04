import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './admin/categories/category.module';
import { AppDataSourceOptions, ENTITY_LIST} from '@stvocab/database';
import { VocabularyModule } from './admin/vocabularies/vocabulary.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './admin/users/user.module';
import { ItemModule } from './admin/items/item.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSourceOptions,
      entities: ENTITY_LIST,
      migrations: [],
    }),
    AuthModule,
    CategoryModule,
    VocabularyModule,
    UserModule,
    ItemModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}