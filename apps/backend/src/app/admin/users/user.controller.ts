import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('admin/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserData: any) {
    return this.userService.create(createUserData);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    return this.userService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserData: any) {
    return this.userService.update(id, updateUserData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}