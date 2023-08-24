import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from './file.model';
import { Folder } from './folder.model';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @OneToMany(() => File, (file) => file.user)
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.user)
  folders: Folder[];
}
