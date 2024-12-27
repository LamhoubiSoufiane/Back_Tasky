import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { User } from "../../users/user/user";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @ManyToOne(() => User, { nullable: false })
    owner: User;

    @ManyToMany(() => User, user => user.teams)
    @JoinTable({
        name: 'team_members',
        joinColumn: {
            name: 'team_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    members: User[];
}
