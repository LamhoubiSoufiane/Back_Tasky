import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';
import { Location } from '../../locations/location/location';
import { User } from '../../users/user/user';



@Entity()
export class Task{
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nom: string | null;
  @Column()
  description: string | null;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column()
  statut: TasksStatut;
  @Column()
  priority: TasksPriority;
  @ManyToOne(() => Location, (location) => location.tasks, { eager: true })
  location: Location;
  @ManyToOne(() => User, (member) => member.tasks, { eager: true })
  member: User;
}