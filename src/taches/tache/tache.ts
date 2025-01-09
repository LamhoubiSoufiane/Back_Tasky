import { User } from "src/users/user/user";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn  } from "typeorm";
import { Location } from 'src/locations/location/location';
@Entity()
export class Tache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;
    
    @Column()
    description: string;
    
    @Column({ type: 'date'})
    startDate: string;
    
    @Column({ type: 'date'})
    endDate: string;
    
    @Column({ type: 'enum', 
        enum: ['a faire', 'en cours', 'terminé', 'annulé'], 
        default: 'a faire' })
    status: string;
    
    @Column({ type: 'enum', 
        enum: ['basse', 'normale', 'haute', 'critique'], 
        default: 'normale'})
    priorite: string;

  //  @ManyToOne()
    @ManyToOne(() => User, (user) => user.taches)
    @JoinColumn({ name: 'member_id' })
    member: User;

    @OneToMany(() => Location, (location) => location.tache, { cascade: true })
    locations: Location[];
}