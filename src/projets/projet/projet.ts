import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Team } from '../../teams/team/team.entity';
import { User } from '../../users/user/user';
import { ProjetStatus } from './ProjetStatus';

@Entity()
export class Projet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    createdById: number;

    @ManyToOne(() => User)
    createdBy: User;

    @Column({ nullable: true })
    teamId: number;

    @ManyToOne(() => Team, (team) => team.projets, { nullable: true })
    team: Team;

    @Column({
        type: 'enum',
        enum: ProjetStatus,
        default: ProjetStatus.EN_COURS
    })
    status: ProjetStatus;
}