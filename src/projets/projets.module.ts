import { Module } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { ProjetsController } from './projets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projet } from './projet/projet';


@Module({
  imports: [TypeOrmModule.forFeature([Projet])],  // Ceci est crucial pour que le repository soit disponible
  providers: [ProjetsService],
  controllers: [ProjetsController],
  //exports: [ProjetsService]
 
})
export class ProjetsModule {}
