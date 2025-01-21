import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../teams/team/team.entity';
import { ProjetStatus } from './ProjetStatus';


@Entity()
export class Projet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;
    @Column({type: 'text', nullable: true})
    description: string;
    
    @Column()
    startDate: Date;
    
    @Column()
    endDate: Date;
    
    @Column()
    status: ProjetStatus;

    @ManyToOne(() => Team, team => team.members)
    team: Team;
}