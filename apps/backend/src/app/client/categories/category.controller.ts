import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserAccessTokenGuard } from '../../auth/guards/user-access-token.guard';
import { ClientCategoryService } from './category.service';

@Controller('client/categories')
@UseGuards(UserAccessTokenGuard)
export class ClientCategoryController {
  constructor(private readonly categoryService: ClientCategoryService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.categoryService.findAll(query);
  }
}
