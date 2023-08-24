import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Folder } from '../../folder/entities/folder.model';
import { User } from '../../user/entities/user.model';
import { FileFlag } from '../../../enums/file-flag.enum';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  size: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: FileFlag,
    default: FileFlag.SAFE,
  })
  file_flag: FileFlag;

  @ManyToOne(() => User, (user) => user.files)
  user: User;

  @ManyToOne(() => Folder, (folder) => folder.files)
  folder: Folder;
}
