import { Injectable } from '@nestjs/common';
import { TaskDto } from '../dto/taskDto';
import { Task } from '../bo/task';
import { Location } from '../../locations/location/location';
import { LocationMapper } from '../../locations/Mapper/locationmapper.mapper';
import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';

@Injectable()
export class TaskMapper {
  toBO(taskDto: TaskDto): Task {
    const task = new Task();
    task.nom = taskDto.nom;
    task.description = taskDto.description;
    task.startDate = new Date(taskDto.startDate);
    task.endDate = new Date(taskDto.endDate);
    task.priority = TasksPriority[taskDto.priority];
    task.statut = TasksStatut[taskDto.statut];
    
    if (taskDto.location) {
      task.location = new LocationMapper().toBO(taskDto.location);
    }
    
    return task;
  }

  toDTO(bo: Task): TaskDto {
    const dto = new TaskDto();
    dto.nom = bo.nom;
    dto.description = bo.description;
    dto.startDate = bo.startDate;
    dto.endDate = bo.endDate;
    dto.priority = bo.priority;
    dto.statut = bo.statut;
    
    if (bo.location) {
      dto.location = new LocationMapper().toDTO(bo.location);
    }
    
    return dto;
  }
}