import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Projet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;
    
    @Column({ type: 'date'})
    startDate: string;
    
    @Column({ type: 'date'})
    endDate: string;
    
    @Column({ type: 'enum', enum: ['planifié', 'en cours', 'terminé', 'annulé'], default: 'planifié' })
    status: string;

}