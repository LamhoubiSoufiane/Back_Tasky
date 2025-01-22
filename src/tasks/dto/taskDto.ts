import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';
import { LocationDto } from '../../locations/dto/locationDto';

export class TaskDto {
    id?: number;
    nom: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: TasksPriority;
    statut: TasksStatut;
    memberId?: number;
    location?: LocationDto;
    projetId: number;
}