import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('admin/items')
@UseGuards(BasicAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll(
    @Query('page') page: string, 
    @Query('limit') limit: string
  ) {
    // Ép kiểu sang số, default page = 1, limit = 20
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 20; 
    return this.itemService.findAll(pageNumber, limitNumber);
  }

  @Post()
  create(@Body() data: any) {
    return this.itemService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.itemService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}