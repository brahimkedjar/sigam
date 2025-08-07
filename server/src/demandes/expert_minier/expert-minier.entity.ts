import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class ExpertMinier {
  @PrimaryGeneratedColumn()
  id_expert: number;

  @Column()
  nom_expert: string;

  @Column()
  fonction: string;

  @Column({ nullable: true })
  num_registre: string;

  @Column()
  organisme: string;


}