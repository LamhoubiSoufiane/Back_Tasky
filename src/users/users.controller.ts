import { Body, Controller, Get, Put,Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user/user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';
import { UserDTO } from './userDto/userDTO';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query('q') searchTerm: string): Promise<User[]> {
    return this.usersService.searchUsers(searchTerm);
  }
/*
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req,@Body() updateUserDto: UserDTO): Promise<User> {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req) :Promise<User> {
    return this.usersService.findById(req.user.userId);
  }
  

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './Uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UserDTO,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Si une image est uploadée, on met à jour son chemin dans la base de données
    if (image) {
      updateUserDto.imageUrl = `/uploads/images/${image.filename}`;
    }

    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

}
