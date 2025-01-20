import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id:number;
  @Column('float')
  latitude:number;
  @Column('float')
  longitude:number;

}