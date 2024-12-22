import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    nom:string | null;
    @Column()
    prenom:string | null;
    @Column()
    username:string | null;
    @Column({ nullable: true })
    imageUrl:string | null;
    @Column()
    pointTotal:number | null;
    @Column()
    pointMensuel:number | null;
    @Column()
    email:string | null;
    @Column()
    password:string | null;
    @Column({ nullable: true })
    refreshToken:string | null;
}
