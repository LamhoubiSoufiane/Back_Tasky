import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    @Post('register')
    async register(@Body() userData:any) {
        return this.authService.register(userData);
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        console.log('login appele !!');

        const user = await this.authService.validateUser(
            body.email,    
            body.password
        );
        if(!user){
            throw new Error('Email Address or Password is incorrect');
        }
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
