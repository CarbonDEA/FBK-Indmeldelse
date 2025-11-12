import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { UnifiService } from '../../integrations/unifi/unifi.service';
import { PaymentService } from '../../integrations/payment/payment.service';
import { MailService } from '../../integrations/mail/mail.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService, UnifiService, PaymentService, MailService],
})
export class MembersModule {}
