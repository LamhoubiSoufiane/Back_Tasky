import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/user/user';
import { Projet } from '../../projets/projet/projet';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    photoTeam: string;

    @ManyToMany(() => User)
    @JoinTable()
    members: User[];

    @OneToMany(() => Projet, projet => projet.team)
    projets: Projet[];
}
