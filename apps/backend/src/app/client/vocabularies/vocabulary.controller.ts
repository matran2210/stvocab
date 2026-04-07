import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserAccessTokenGuard } from '../../auth/guards/user-access-token.guard';
import { ClientVocabularyService } from './vocabulary.service';

@Controller('client/vocabularies')
@UseGuards(UserAccessTokenGuard)
export class ClientVocabularyController {
  constructor(private readonly vocabularyService: ClientVocabularyService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.vocabularyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabularyService.findOne(id);
  }
}
