import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './admin/categories/category.module';
import { AppDataSourceOptions, ENTITY_LIST} from '@stvocab/database';
import { VocabularyModule } from './admin/vocabularies/vocabulary.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './admin/users/user.module';
import { ItemModule } from './admin/items/item.module';
import { ClientCategoryModule } from './client/categories/category.module';
import { ClientVocabularyModule } from './client/vocabularies/vocabulary.module';

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
    ItemModule,
    ClientCategoryModule,
    ClientVocabularyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
