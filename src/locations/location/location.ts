import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../tasks/bo/task';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id:number;
  @Column('float')
  latitude:number;
  @Column('float')
  longitude:number;
  @OneToMany(() => Task, (task) => task.location, { cascade: true })
  tasks: Task[];
}