import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserDTO } from '../users/userDto/userDTO';
import { AuthDto } from './authDTO/authDto';
import { OtpService } from './otp.service';
import { InvalidCredentials } from '../exception/InvalidCredentials';



@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private otpService : OtpService
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
        if(!user) throw new InvalidCredentials('Email Adress or Password is incorrect',203);
        return this.authService.login(user);
    }


    @Post('logout') 
    async logout(@Body('refreshToken') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    /*
    Cette endpoint est pour reinitialiser le mdp
    d'un utilisateur qui n'est pas encore authentifié
    * */
    @Post('reset-password-request')
    async requestPasswordReset(@Body('email') email: string): Promise<string> {
        const otp = await this.otpService.generateAndStoreOtp(email);
        await this.otpService.sendOtpEmail(email,  otp);
        return "Un code de vérification est envoyé à l'adresse mail ";
        //return this.authService.sendPasswordResetOTP(email);
    }

    /*
    Cette endpoint est pour reinitialiser le mdp
    d'un utilisateur qui est deja authentifié et il veut
    changer son mot de passe
    * */
    /*@Post('change-password')
    async changePassword(
      @Body('userId') userId: string,
      @Body('currentPassword') currentPassword: string,
      @Body('newPassword') newPassword: string,
    ) {
        return this.authService.changePassword(userId, currentPassword, newPassword);
    }
    */
    @Post('verify-otp')
    async verifyOTP(
      @Body('email') email: string,
      @Body('otp') otp: string,
      //@Body('newPassword') newPassword: string,
    ) {
        return this.otpService.validateOtp(email, otp);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    async refreshToken(@Req() req: any) {
        const payload = req.user;
        return this.authService.generateTokens(payload.userId, payload.username);
    }
}
