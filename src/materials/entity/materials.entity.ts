// defind meterials entity

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Materials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  status: string;

  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'create_at',
  })
  createAt: Date;

  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'update_at',
  })
  updateAt: Date;

  // many to one user
  // @ManyToOne(() => Users, (user) => user.meterials)
  // @JoinColumn({ name: 'user_id' })
  // user: Users;
}
