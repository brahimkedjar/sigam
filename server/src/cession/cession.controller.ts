
import { BadRequestException, Body, Controller, Get, Query, NotFoundException, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { PaymentService } from 'src/demandes/paiement/payment.service';
import { StatutProcedure } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCessionDto } from './create-cession.dto';
import { CessionService } from './cession.service';

@Controller('api/procedures')
export class CessionController {

  constructor( private readonly proceduresService: CessionService, private readonly paymentService: PaymentService,private prisma: PrismaService) {}


@Post('cession/check-payments')
async checkPayments(@Body() body: { permisId: number }) {
  // 1. Check payments
  const { isPaid, missing } = await this.paymentService.checkAllObligationsPaid(body.permisId);

  if (!isPaid) {
    const message = missing
      .map(m => `- ${m.libelle}: ${m.montantRestant.toLocaleString()} DZD`)
      .join('\n');
    
    throw new BadRequestException(
      `il existe des obligations non payés :\n${message}`
    );
  }

  return { 
    ok: true,
  };
}    



  @Post('cession/start')
  async startCession(@Body() dto: CreateCessionDto) {
    return this.proceduresService.startCessionWithOriginalData(
      dto.permisId,
      dto.date_demande,
      StatutProcedure.EN_COURS
    );
  }

@Get('cession/permis')
  async getPermis() {
    return this.proceduresService.getPermis();
  }

  @Get('cession/wilayas')
  async getWilayas() {
    return this.proceduresService.getWilayas();
  }

  @Get('cession/typepermis')
  async getTypesPermis() {
    return this.proceduresService.getTypesPermis();
  }
}


