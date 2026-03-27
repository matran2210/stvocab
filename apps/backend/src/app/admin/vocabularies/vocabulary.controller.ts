import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('admin/vocabularies')
@UseGuards(BasicAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabService: VocabularyService) {}

  @Post()
  create(@Body() body: any) {
    return this.vocabService.create(body);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.vocabService.update(id, body, file);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.vocabService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabService.remove(id);
  }

  @Get('auto-fill/:word')
  async autoFill(@Param('word') word: string) {
    return this.vocabService.autoFill(word);
  }

  @Get('pick-unsplash/:word')
  async pickUnsplash(
    @Param('word') word: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.vocabService.pickUnsplash(word, page, limit);
  }
}
