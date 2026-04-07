import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from '@stvocab/database';
import { AuthModule } from '../../auth/auth.module';
import { ClientVocabularyController } from './vocabulary.controller';
import { ClientVocabularyService } from './vocabulary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary]), AuthModule],
  controllers: [ClientVocabularyController],
  providers: [ClientVocabularyService],
})
export class ClientVocabularyModule {}
