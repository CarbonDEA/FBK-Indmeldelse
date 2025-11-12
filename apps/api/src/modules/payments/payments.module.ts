import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DineroService } from '../../integrations/dinero/dinero.service';
import { PaymentService } from '../../integrations/payment/payment.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, DineroService, PaymentService],
})
export class PaymentsModule {}
