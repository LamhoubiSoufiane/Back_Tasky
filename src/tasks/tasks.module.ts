import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './bo/task';
import { Location } from '../locations/location/location';
import { User } from '../users/user/user';
import { LocationsService } from '../locations/locations.service';
import { Projet } from '../projets/projet/projet';
import { ProjetsModule } from '../projets/projets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Location, User, Projet]),
    ProjetsModule
  ],
  controllers: [TasksController],
  providers: [TasksService, LocationsService],
  exports: [TasksService, TypeOrmModule]
})
export class TasksModule {}
