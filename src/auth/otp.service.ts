import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as speakeasy from 'speakeasy';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs'; // Pour le template d'email
//import * as fs from 'fs';
import * as path from 'path'

@Injectable()
export class OtpService {
  private redis: Redis;
  private readonly SECRET = 'S3CR3T';
  private readonly OTP_EXPIRATION_MINUTES = 1;
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }


  async generateAndStoreOtp(email: string): Promise<string> {
    const otp = speakeasy.totp({
      secret: this.SECRET,
      encoding: 'base32',
    });
    await this.saveOtpForUser(email,otp);
    return otp;
  }

  async saveOtpForUser(email: string, otp: string): Promise<void> {
    const ttlInSeconds = this.OTP_EXPIRATION_MINUTES * 60;
    await this.redis.set(`${email}:otp`, otp, 'EX', ttlInSeconds);
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'otp-email.ejs');
    const htmlContent = await ejs.renderFile(templatePath, { otp });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Password Reset OTP',
      html: htmlContent,
      attachments: [
        {
          filename: 'Tasky.jpeg',
          path: path.join(__dirname, '..', 'static', 'images', 'Tasky.jpeg'),
          cid: 'Tasky',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.getOtpForUser(email);
    return otp === storedOtp;
  }
  async getOtpForUser(email: string): Promise<string | null> {
    return this.redis.get(`${email}:otp`);
  }
}