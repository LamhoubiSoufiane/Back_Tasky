import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';

export class TaskDto {
  readonly nom: string;
  readonly description: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly statut: TasksStatut;
  readonly priority: TasksPriority;
  readonly location: Location;
}