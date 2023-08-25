import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.model';
import { File } from '../../file/entities/file.model';
import { BaseModel } from '../../../models/utility/ BaseModel';

@Entity('folder')
export class Folder extends BaseModel {
  @Column()
  name: string;

  @ManyToOne(() => User, (owner) => owner.folders)
  owner: User;

  @OneToMany(() => File, (file) => file.folder, { nullable: true })
  files: File[];
}
