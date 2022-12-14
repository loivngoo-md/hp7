import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { INVALID_PASSWORD } from 'src/common/constant/error-message';
import { DEPOSIT_WITHDRAWAL_STATUS } from 'src/common/enums';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import AppUser from '../../modules/app-user/entities/app-user.entity';
import { WithdrawalQuery } from './dto/query-withdrawal.dto';
import { Withdraw } from './entities/withdraw.entity';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>,
    private readonly _appUserService: AppUserService,
  ) {}

  async validatePassword(
    user: AppUser,
    withdraw_password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(withdraw_password, user.withdraw_password);
  }

  async create(dto: any, byCms?: boolean) {
    const { amount, username } = dto;
    const user = await this._appUserService.findByUsername(username);
    dto['user_id'] = user['id'];

    if (
      !byCms &&
      !(await this.validatePassword(user, dto['withdraw_password']))
    ) {
      throw new NotFoundException(INVALID_PASSWORD);
    }

    if (+user['balance'] < +amount) {
      throw new HttpException(
        'Do not enough money to withdraw.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._appUserService.update(user.id, {
      balance_frozen: +user['balance_frozen'] + +amount,
      balance_avail: +user['balance_avail'] - +amount,
    });
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async findAll(query: WithdrawalQuery, user_id?: number) {
    const page = query['page'] || 1;
    const limit = query['limit'] || 10;

    const end_time = query['end_time']
      ? new Date(query['end_time'])
      : new Date();
    const start_time = query['start_time']
      ? new Date(query['start_time'])
      : null;

    if (user_id) {
      query['user_id'] = user_id;
      delete query['username'];
    }

    query['created_at'] = start_time
      ? Between(start_time, end_time)
      : LessThanOrEqual(end_time);

    delete query['start_time'];
    delete query['end_time'];
    delete query['page'];
    delete query['limit'];

    return this._withdrawRepo.find({
      where: query,
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: number) {
    const response = await this._withdrawRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
  }

  async reviewByCms(withdraw_id: number, isAccept: boolean) {
    const withdrawal = await this.findOne(withdraw_id);
    if (withdrawal['status'] !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new HttpException(
        'Withdrawal is not pending',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this._appUserService.findOne(withdrawal['user_id']);
    if (isAccept) {
      await Promise.all([
        this._withdrawRepo.update(withdraw_id, {
          status: DEPOSIT_WITHDRAWAL_STATUS.SUCCESS,
        }),
        this._appUserService.update(withdrawal['user_id'], {
          balance: +user['balance'] - +withdrawal['amount'],
          balance_frozen: 0,
        }),
      ]);
    } else {
      await Promise.all([
        this._withdrawRepo.update(withdraw_id, {
          status: DEPOSIT_WITHDRAWAL_STATUS.FAIL,
        }),
        this._appUserService.update(withdrawal['user_id'], {
          balance_avail: +user['balance_avail'] + +withdrawal['amount'],
          balance_frozen: 0,
        }),
      ]);
    }

    return { isSuccess: true };
  }
}
