import { ORDER_TYPE } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'orders' })
export class Order extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ORDER_TYPE;

  @Column('varchar')
  stock_code: string;

  @Column('integer')
  quantity: number;

  @Column('float8', {nullable: true})
  price: number;

  @Column('float8', {nullable: true})
  fee_rate: number;

  @Column('float8')
  amount: number;

  @Column('float8', {nullable: true})
  actual_amount: number;

  @Column('integer')
  user_id: number;

  @Column('bool', { nullable: true })
  is_resolved: boolean;

  @Column('varchar', { default: '' })
  remarks: string;

  @Column()
  stock_market: string;

  @Column()
  stock_name: string;

  @Column('float8')
  zhangting: number;

  @Column('float8')
  dieting: number;

  // TODO: Remove nullable trading_session
  @Column('varchar', { nullable: true })
  trading_session: string;
}
