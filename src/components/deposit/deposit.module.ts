import { forwardRef, Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Deposit from './entities/deposit.entity';
import { DepositAccountModule } from '../deposit-account/deposit-account.module';
import { AppUserModule } from '../../modules/app-user/app-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    forwardRef(() => AppUserModule),
    DepositAccountModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}
