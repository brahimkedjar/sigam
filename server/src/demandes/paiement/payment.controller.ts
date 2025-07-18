// src/payments/payment.controller.ts

import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './create-payment.dto';
import { ObligationResponseDto } from './obligation-response.dto';
import { PaymentResponseDto } from './payment-response.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

// Backend NestJS
@Get('procedures/:id')
async getProcedure(@Param('id') id: number) {
  const procedure = await this.paymentService.getProcedureWithPermis(+id);
  return {
    ...procedure,
    permis: procedure!.permis?.[0] || null, // renvoie directement l'objet
  };
}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('obligations/:permisId')
  getObligations(@Param('permisId') permisId: string): Promise<ObligationResponseDto[]> {
    return this.paymentService.getObligationsForPermis(parseInt(permisId));
  }

  @Get('payments/:obligationId')
  getPayments(@Param('obligationId') obligationId: string): Promise<PaymentResponseDto[]> {
    return this.paymentService.getPaymentsForObligation(parseInt(obligationId));
  }

  @Post('initialize/:permisId')
  initializeObligations(@Param('permisId') permisId: string) {
    return this.paymentService.createInitialObligations(parseInt(permisId));
  }

  @Get('obligations')
async getAllObligations(): Promise<ObligationResponseDto[]> {
  return this.paymentService.getAllObligationsWithDetails();
}

@Get('stats')
getGlobalStats() {
  return this.paymentService.getGlobalPaymentSummary();
}

@Post('generate-receipt/:paymentId')
async generateReceipt(@Param('paymentId') paymentId: string) {
  try {
    const result = await this.paymentService.generatePaymentReceipt(parseInt(paymentId));
    return {
      success: true,
      pdfUrl: result.pdfUrl,
      paymentDetails: result.paymentDetails
    };
  } catch (error) {
    console.error('Receipt generation failed:', error);
    throw new HttpException(
      'Failed to generate receipt: ' + error.message,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// payment.controller.ts
@Get('check-obligations/:permisId')
async checkObligationsPaid(@Param('permisId') permisId: string) {
  
  return this.paymentService.checkAllObligationsPaid(+permisId);
}

}