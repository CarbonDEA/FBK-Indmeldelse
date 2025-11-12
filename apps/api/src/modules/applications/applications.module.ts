import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UnifiService } from '../../integrations/unifi/unifi.service';
import { DineroService } from '../../integrations/dinero/dinero.service';
import { PaymentService } from '../../integrations/payment/payment.service';
import { MailService } from '../../integrations/mail/mail.service';

@Module({
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    UnifiService,
    DineroService,
    PaymentService,
    MailService,
  ],
})
export class ApplicationsModule {}
