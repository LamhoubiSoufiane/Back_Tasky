import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './user/user';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('search')
    async searchUsers(@Query('q') searchTerm: string): Promise<User[]> {
        return this.usersService.searchUsers(searchTerm);
    }
}
