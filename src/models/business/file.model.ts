import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Folder } from './folder.model';
import { User } from './user.model';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  size: number;

  @ManyToOne(() => User, (user) => user.files)
  user: User;

  @ManyToOne(() => Folder, (folder) => folder.files)
  folder: Folder;
}
