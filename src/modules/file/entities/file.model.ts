import { Entity, Column, ManyToOne } from 'typeorm';
import { Folder } from '../../folder/entities/folder.model';
import { User } from '../../user/entities/user.model';
import { FileFlag } from '../../../enums/file-flag.enum';
import { BaseModel } from '../../../models/utility/ BaseModel';
import { AdminReviewComment } from '../../../enums/admin-review-comment.enum';

@Entity('file')
export class File extends BaseModel {
  @Column()
  filename: string;

  @Column()
  size: number;

  // path to the file on the host system
  @Column()
  file_path: string;

  @Column({ nullable: false, default: '' })
  file_url: string;

  @Column({ nullable: true, default: 0 })
  admin_review_count: number;

  @Column({ nullable: false, default: AdminReviewComment.FILE_OKAY })
  admin_review_comment: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: FileFlag,
    default: FileFlag.SAFE,
  })
  file_flag: FileFlag;

  @ManyToOne(() => User, (owner) => owner.files)
  owner: User;

  @ManyToOne(() => Folder, (folder) => folder.files)
  folder: Folder;
}
