import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user/user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query('q') searchTerm: string): Promise<User[]> {
    return this.usersService.searchUsers(searchTerm);
  }
}
