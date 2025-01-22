import { Module } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { ProjetsController } from './projets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projet } from './projet/projet';
import { User } from '../users/user/user';
import { Team } from '../teams/team/team.entity';
import { ProjetMapper } from './Mapper/projetMapper.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projet, User, Team])
  ],
  providers: [ProjetsService, ProjetMapper],
  controllers: [ProjetsController],
  exports: [ProjetsService, TypeOrmModule]
})
export class ProjetsModule {}
