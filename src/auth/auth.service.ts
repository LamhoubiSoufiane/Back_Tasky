import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDTO } from '../users/userDto/userDTO';
import { User } from '../users/user/user';
import { AuthDto } from './authDTO/authDto';
import { InvalidCredentials } from '../exception/InvalidCredentials';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authDto: AuthDto): Promise<any> {
    const user = await this.usersService.findByEmail(authDto.email);
    if (user && (await bcrypt.compare(authDto.password, user.password))) {
      return user;
    }
    return null;
  }
  async register(userDto: UserDTO) {
    const user = await this.usersService.findByEmail(userDto.email);
    if (user) throw new InvalidCredentials('User already exists',203);
    return this.usersService.createUser(userDto);
  }
  /*async register(userData:any){
      const user = await this.usersService.findByEmail(userData.email);
      if(user){
          throw new Error('User already exists');
      }
      return this.usersService.createUser(userData);
  }*/

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    await this.usersService.saveRefreshToken(user.id, refresh_token);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nom: user.nom,
      prenom: user.prenom,
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async generateTokens(userId: number, username: string) {
    const payload = { sub: userId, username };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
  async validateRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      });
      return payload;
    } catch (error) {
      throw new InvalidCredentials('Invalid refresh token',203);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      });
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new InvalidCredentials('Invalid refresh token',203);
      }
      const newPayload = { email: user.email, sub: user.id };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });
      await this.usersService.saveRefreshToken(user.id, newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new InvalidCredentials('Invalid refresh token',203);
    }
  }


  async logout(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new InvalidCredentials('Invalid refresh token',203);
    }
    await this.usersService.saveRefreshToken(user.id, null);
    return { message: 'Logged out successfully' };
  }

  async changePassword(id: number | null, email: string | null,oldPassword: string | null, newPassword: string): Promise<string>{
    if (!id && !email) {
      throw new BadRequestException('Utilisateur introuvable.');
    }
    const user = id
      ? await this.usersService.findById(id)
      : await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable.');
    }
    if(oldPassword){
      const isPasswordValid = await bcrypt.compare(oldPassword,user.password);
      if(!isPasswordValid) throw new UnauthorizedException('Ancien mot de passe incorrect');

    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.email, hashedPassword);
    return 'Mot de passe modifié avec succès.';
  }
}
