import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from '../src/users/user/user';
import { Team } from '../src/teams/team/team.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '5179',
      database: 'tasky_test',
      entities: [User, Team],
      synchronize: true,
      dropSchema: true, // Réinitialise la base de données à chaque test
    }),
  ],
})
export class TestDatabaseModule {}
