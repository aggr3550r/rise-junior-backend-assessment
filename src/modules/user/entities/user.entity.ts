import { Entity, Column, OneToMany } from 'typeorm';
import { File } from '../../file/entities/file.entity';
import { Folder } from '../../folder/entities/folder.entity';
import { UserRole } from '../../../enums/user-role.enum';
import { BaseModel } from '../../../models/utility/ BaseModel';

@Entity('user')
export class User extends BaseModel {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

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
