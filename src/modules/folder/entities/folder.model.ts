import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.model';
import { File } from '../../file/entities/file.model';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.folders)
  user: User;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];
}
