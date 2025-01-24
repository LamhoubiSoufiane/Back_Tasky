import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user/user';
import { Task } from '../../tasks/bo/task';

@Entity()
export class Aide {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    dateCreation: Date;

    @Column({ default: 'en_attente' })
    status: string; // en_attente, acceptée, refusée, terminée

    @ManyToOne(() => User, user => user.aidesRecues)
    demandeur: User;

    @ManyToOne(() => User, user => user.aidesProposees)
    aidant: User;

    @ManyToOne(() => Task, task => task.aides, { nullable: false })
    task: Task;
}
