import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from '../../file/entities/file.model';
import { Folder } from '../../folder/entities/folder.model';
import { UserRole } from '../../../enums/user-role.enum';

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

  @Column({
    nullable: false,
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => File, (file) => file.user)
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.user)
  folders: Folder[];
}
