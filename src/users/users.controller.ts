import { Body, Controller, Get, Put,Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user/user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';
import { UserDTO } from './userDto/userDTO';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query('q') searchTerm: string): Promise<User[]> {
    return this.usersService.searchUsers(searchTerm);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req,@Body() updateUserDto: UserDTO): Promise<User> {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req) :Promise<User> {
    return this.usersService.findById(req.user.userId);
  }
}
