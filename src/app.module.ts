import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { TeamModule } from './teams/team.module';
import { User } from './users/user/user';
import { Location } from './locations/location/location';
import { Team } from './teams/team/team.entity';
import { ProjetsModule } from './projets/projets.module';
import { ProjetsController } from './projets/projets.controller';
import { ProjetsService } from './projets/projets.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      extra: {
        trustServerCertificate: true,
      },
    }),
    UsersModule,
    AuthModule,
    ProjetsModule,
    LocationsModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
