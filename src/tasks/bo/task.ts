import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/user/user';
import { Location } from '../../locations/location/location';
import { TasksStatut } from '../Enum/tasksStatut.enum';
import { TasksPriority } from '../Enum/tasksPriority.enum';
import { Projet } from '../../projets/projet/projet';
import { Aide } from '../../aides/aide/aide.entity';

@Entity()
export class Task{
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  nom: string;
  
  @Column()
  description: string;
  
  @Column()
  startDate: Date;
  
  @Column()
  endDate: Date;
  
  @Column({
    type: 'enum',
    enum: TasksPriority,
    default: TasksPriority.NORMALE
  })
  priority: TasksPriority;

  @Column({
    type: 'enum',
    enum: TasksStatut,
    default: TasksStatut.AFAIRE
  })
  statut: TasksStatut;

  @ManyToOne(() => User, user => user.tasks)
  member: User;

  @ManyToOne(() => Location, location => location.tasks)
  location: Location;

  @ManyToOne(() => Projet, projet => projet.tasks, { nullable: false })
  projet: Projet;

  @OneToMany(() => Aide, aide => aide.task)
  aides: Aide[];
}