import { forwardRef, Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { AppUserModule } from '../../modules/app-user/app-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdraw]),
    forwardRef(() => AppUserModule),
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService]
})
export class WithdrawModule { }
