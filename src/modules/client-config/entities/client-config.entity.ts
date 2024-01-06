import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../../models/utility/ BaseModel';

@Entity('clientconfig')
export class ClientConfig extends BaseModel {
  @Column({ nullable: false, default: false })
  compress: boolean;

  @Column({ nullable: true })
  maxFileSize: number; // in bytes

  @Column({ nullable: true, default: 100.0 })
  minFileSize: number; // in bytes
}
