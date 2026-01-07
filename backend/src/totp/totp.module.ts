import { Module } from '@nestjs/common';
import { TotpService } from './totp.service';
import { TotpController } from './totp.controller';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [UsersModule, CommonModule],
  controllers: [TotpController],
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
