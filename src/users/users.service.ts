import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/user';
import * as bcrypt from 'bcrypt';
import { UserDTO } from './userDto/userDTO';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async createUser(userDto: UserDTO): Promise<User> {
    const user = new User();
    user.email = userDto.email;
    user.nom = userDto.nom;
    user.prenom = userDto.prenom;
    user.username = userDto.username;
    user.pointMensuel = 50;
    user.pointTotal = 0;

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userDto.password, salt);
    user.password = hash;

    return this.usersRepository.save(user);
  }

  async hasValidRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user && user.refreshToken === refreshToken;
  }

  async saveRefreshToken(userId: number, refreshToken: string | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.refreshToken = refreshToken;
    await this.usersRepository.save(user);
  }

  async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user && user.refreshToken === refreshToken;
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teams', 'team')
      .leftJoinAndSelect('team.owner', 'owner')
      .where(
        'LOWER(user.username) LIKE LOWER(:searchTerm) OR LOWER(user.email) LIKE LOWER(:searchTerm)',
        {
          searchTerm: `%${searchTerm}%`,
        },
      )
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.nom',
        'user.prenom',
        'team.id',
        'team.nom',
        'owner.id',
        'owner.username',
        'owner.nom',
        'owner.prenom',
      ])
      .getMany();
  }
}
