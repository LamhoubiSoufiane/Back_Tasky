import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id:number;
  @Column('float')
  latitude:number;
  @Column('float')
  longitude:number;

}