import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { Projet } from './projet/projet';
import { TeamModule } from '../teams/team.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Projet]),
        TeamModule,
        UsersModule,
    ],
    controllers: [ProjetsController],
    providers: [ProjetsService],
    exports: [ProjetsService],
})
export class ProjetsModule {}
