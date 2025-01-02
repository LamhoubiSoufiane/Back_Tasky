

import { Injectable } from '@nestjs/common';
import { TaskDto } from '../dto/taskDto';
import { Task } from '../bo/task';
import { Location } from '../../locations/location/location';
import { LocationMapper } from '../../locations/Mapper/locationmapper.mapper';


@Injectable()
export class TaskMapper {
  toBO(taskDto: TaskDto): Task {
    const task = new Task();
    task.nom = taskDto.nom;
    task.location = new Location();
    task.location = new LocationMapper().toBO(taskDto.location);
    task.endDate = taskDto.endDate;
    task.startDate = taskDto.startDate;
    task.description = taskDto.description;
    task.priority = taskDto.priority;
    task.statut = taskDto.statut;
    return task;
  }

  toDTO(bo: Task): TaskDto {
    const dto = new TaskDto();
    dto.nom = bo.nom;
    dto.location = new Location();
    dto.location = new LocationMapper().toDTO(bo.location);
    dto.endDate = bo.endDate;
    dto.startDate = bo.startDate;
    dto.description = bo.description;
    dto.priority = bo.priority;
    dto.statut = bo.statut;
    return dto;
  }
}