import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
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

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable({
    name: 'team_members',
    joinColumn: {
      name: 'team_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[];

  @OneToMany(() => Projet, projet => projet.team)
  projets: Projet[];
}
