import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { File } from '../../file/entities/file.entity';
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
