import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from '../../file/entities/file.model';
import { Folder } from '../../folder/entities/folder.model';
import { UserRole } from '../../../enums/user-role.enum';
import { BaseModel } from '../../../models/utility/ BaseModel';

@Entity('user')
export class User extends BaseModel {
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

  @OneToMany(() => File, (file) => file.owner, { nullable: true })
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.owner, { nullable: true })
  folders: Folder[];
}
