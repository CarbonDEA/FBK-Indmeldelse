import {
  Controller,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhooks')
  @ApiOperation({ summary: 'Handle payment provider webhook' })
  async webhook(
    @Headers('x-webhook-signature') signature: string,
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(signature, body);
  }

  @Post('csv/import')
  @ApiOperation({ summary: 'Import payments from CSV' })
  async importCSV(@Body('csvContent') csvContent: string) {
    return this.paymentsService.importFromCSV(csvContent);
  }
}
