import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard'; // Đường dẫn trỏ ra ngoài thư mục auth

@Controller('admin/categories')
@UseGuards(BasicAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() body: any) {
    return this.categoryService.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}