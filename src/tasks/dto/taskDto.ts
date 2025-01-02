import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';
import { LocationDto } from '../../locations/dto/locationDto';

export class TaskDto {
  public nom: string;
  public description: string;
  public startDate: Date;
  public endDate: Date;
  public statut: TasksStatut;
  public priority: TasksPriority;
  public location: LocationDto;
}