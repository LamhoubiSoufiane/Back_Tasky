import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './bo/task';
import { Location } from '../locations/location/location';
import { User } from '../users/user/user';
import { LocationsService } from '../locations/locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Location, User])],
  controllers: [TasksController],
  providers: [TasksService, LocationsService],
  exports: [TasksService],
})
export class TasksModule {}

