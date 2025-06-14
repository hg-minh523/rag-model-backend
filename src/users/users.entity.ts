import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../departments/departments.entity';
import { Shop } from '../shops/shops.entity';
import { Channel } from 'src/channels/channels.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({
    type: 'varchar',
    length: 80,
    unique: true,
    nullable: false,
    name: 'username',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    name: 'password',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 80,
    unique: true,
    nullable: true,
    name: 'email',
  })
  email?: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    name: 'phone',
  })
  phone?: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    name: 'name',
  })
  name?: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'avatar',
  })
  avatar?: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: false,
    name: 'platform',
  })
  platform: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    name: 'zalo_id',
  })
  zaloId?: string;

  // Foreign key to Shop
  @Column({ type: 'uuid', name: 'shop_id' })
  shopId: string;

  // Many-to-One relationship with Shop
  @ManyToOne(() => Shop, (shop) => shop.admins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  // Many-to-Many relationship with Departments
  @ManyToMany(() => Department, (department) => department.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_department',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'department_id',
      referencedColumnName: 'id',
    },
  })
  departments: Department[];

  @ManyToMany(() => Channel, (channel) => channel.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinTable({
    name: 'user_channels',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'channel_id', referencedColumnName: 'id' },
  })
  channels: Channel[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date;
}
