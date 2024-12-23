import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ){}

    async validateUser(email: string, password: string): Promise<any> {
        console.log("appel a la fonction validate User !!");
        const user = await this.usersService.findByEmail(email);
        if(!user) console.log("user n est pas trouve par l adresse mail");
        console.log("find by email user : ",user.email);
        if (user && (await bcrypt.compare(password, user.password))) {
            console.log("password passe : ",password);
            console.log("password user : ",user.password);
            console.log("comparaison entre les pwd : ", bcrypt.compare(password, user.password));
            ///const { password, ...result } = user;
            return user;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload,{expiresIn:'15m'}),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
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
          throw new Error('Invalid refresh token');
        }
      }

    async refreshTokens(refreshToken: string) {
        try{
            const payload = this.jwtService.verify(refreshToken, {
                secret:process.env.JWT_REFRESH_SECRET_KEY,
            });
            const user = await this.usersService.findByEmail(payload.email);
            if(!user){
                throw new Error('Invalid refresh token');
            }
            const newPayload = {email:user.email,sub:user.id};
            const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
            await this.usersService.saveRefreshToken(user.id, newRefreshToken);

            return{
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            }
        }catch(e){
            throw new Error('Invalid refresh token');
        }
        
    }
    

    async register(userData:any){
        const user = await this.usersService.findByEmail(userData.email);
        if(user){
            throw new Error('User already exists');
        }
        return this.usersService.createUser(userData);
    }

    async logout(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET_KEY});
        const user = await this.usersService.findByEmail(payload.email);
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        await this.usersService.saveRefreshToken(user.id, null);
        return { message: 'Logged out successfully' };
    }
}
