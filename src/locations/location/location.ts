import { Tache } from "src/taches/tache/tache";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id:number;
  @Column('float')
  latitude:number;
  @Column('float')
  longitude:number;
  @ManyToOne(() => Tache, (tache) => tache.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tache_id' })
  tache: Tache;
}