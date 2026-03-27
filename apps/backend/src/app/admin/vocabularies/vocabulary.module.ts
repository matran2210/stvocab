import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { Vocabulary } from '@stvocab/database';
import { CloudinaryService } from './cloudinary.service';
import { AiGenerationService } from './ai-generation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary])],
  controllers: [VocabularyController],
  providers: [VocabularyService,CloudinaryService, AiGenerationService],
})
export class VocabularyModule {}