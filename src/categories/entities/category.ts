import { Item } from 'src/items/entities/item';
import { Shop } from 'src/shops/entities/shop';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('simple-array', { default: [] })
  images: string[];

  @ManyToOne(() => Shop, (shop) => shop.categories)
  shop: Shop;

  @OneToMany(() => Item, (item) => item.category)
  items: Item[];

  @Column({ nullable: true })
  status?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
