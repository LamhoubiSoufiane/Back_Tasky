import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Team } from '../../teams/team/team.entity';
import { Task } from '../../tasks/bo/task';
import { Aide } from '../../aides/aide/aide.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string | null;

  @Column()
  prenom: string | null;

  @Column()
  username: string | null;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column({ default: 0 })
  pointTotal: number | null;

  @Column({ default: 50 })
  pointMensuel: number | null;

  @Column()
  email: string | null;

  @Column()
  password: string | null;

  @Column({ nullable: true })
  refreshToken: string | null;
  /*@Column()
  fcmToken: string | null;*/

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];

  @OneToMany(() => Task, (task) => task.member)
  tasks: Task[];

  @OneToMany(() => Aide, aide => aide.demandeur)
  aidesRecues: Aide[];

  @OneToMany(() => Aide, aide => aide.aidant)
  aidesProposees: Aide[];
}
