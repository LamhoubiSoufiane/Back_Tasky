import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Team } from '../../teams/team/team.entity';
import { ProjetStatus } from './ProjetStatus';
import { Task } from '../../tasks/bo/task';

@Entity()
export class Projet {
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
        enum: ProjetStatus,
        default: ProjetStatus.Planifie
    })
    status: ProjetStatus;

    @ManyToOne(() => Team, team => team.projets, { nullable: false })
    team: Team;

    @OneToMany(() => Task, task => task.projet)
    tasks: Task[];
}