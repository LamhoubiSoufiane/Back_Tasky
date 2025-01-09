import { Module } from '@nestjs/common';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tache } from './tache/tache';
import { User } from 'src/users/user/user';
import { Location } from '../locations/location/location';

@Module({
  imports: [TypeOrmModule.forFeature([Tache,User,Location])],
  providers: [TachesService],
  controllers: [TachesController]
})
export class TachesModule {}
