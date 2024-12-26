import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserDTO } from '../users/userDto/userDTO';
import { AuthDto } from './authDTO/authDto';



@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    /*@Post('register')
    async register(@Body() userData:any) {
        return this.authService.register(userData);
    }*/
    @Post('register')
    async register(@Body() userDto:UserDTO){
        return this.authService.register(userDto);
    }

    @Post('login')
    async login(@Body() authDto : AuthDto){
        const user = await this.authService.validateUser(authDto);
        if(!user) throw new Error('Email Adress or Password is incorrect');
        return this.authService.login(user);
    }


    @Post('logout') 
    async logout(@Body('refreshToken') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    async refreshToken(@Req() req: any) {
        const payload = req.user;
        return this.authService.generateTokens(payload.userId, payload.username);
    }
}
