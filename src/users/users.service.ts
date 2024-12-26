import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user/user';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDTO } from './userDto/userDTO';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ){}

    async findByEmail(email:string):Promise<User | undefined>{
        return this.usersRepository.findOne({where:{email}});
    }

    async createUser(userDto:UserDTO):Promise<User>{
        const hashedPassword = await bcrypt.hash(userDto.password,10);
        return this.usersRepository.save({
            ...userDto,
            password:hashedPassword,
            pointTotal:0,
            pointMensuel:50
        });
        
    }

    async saveRefreshToken(userId: number, refreshToken: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new Error('User not found');
        }
        user.refreshToken = refreshToken; 
        await this.usersRepository.save(user);
      }
      async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        return user && user.refreshToken === refreshToken;
      }
}
