import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../models/utility/ BaseModel';
import { ClientConfig } from '../../client-config/entities/client-config.entity';

@Entity('client')
export class Client extends BaseModel {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  clientKey: string;

  @Column({ nullable: true })
  metadata: string;

  @OneToOne(() => ClientConfig, (config) => config.id, {
    eager: true,
  })
  @JoinColumn()
  config: string;
}
