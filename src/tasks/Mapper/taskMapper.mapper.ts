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
    task.nom = taskDto.nom || 'Nouvelle tâche';
    task.description = taskDto.description;
    task.startDate = taskDto.startDate ? new Date(taskDto.startDate) : new Date();
    task.endDate = taskDto.endDate ? new Date(taskDto.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days by default
    task.priority = taskDto.priority || TasksPriority.NORMALE;
    task.statut = taskDto.statut || TasksStatut.AFAIRE;
    
    if (taskDto.location) {
      task.location = new LocationMapper().toBO(taskDto.location);
    }
    
    return task;
  }

  toDTO(bo: Task): TaskDto {
    const dto = new TaskDto();
    dto.id = bo.id;
    dto.nom = bo.nom;
    dto.description = bo.description;
    dto.startDate = bo.startDate;
    dto.endDate = bo.endDate;
    dto.priority = bo.priority;
    dto.statut = bo.statut;
    dto.memberId = bo.member?.id;
    dto.projetId = bo.projet?.id;
    
    if (bo.location) {
      dto.location = new LocationMapper().toDTO(bo.location);
    }
    
    return dto;
  }
}