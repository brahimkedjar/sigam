import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProcedureRenouvellementService } from './procedure_renouvellemnt.service';
import { CreateRenewalDto } from './create-renouvellement.dto';
import { PaymentService } from 'src/demandes/paiement/payment.service';
import { StatutProcedure } from '@prisma/client';
@Controller('api/procedures')
export class ProcedureRenouvellementController {
  constructor(private readonly proceduresService: ProcedureRenouvellementService, private readonly paymentService: PaymentService) {}

 
  @Get(':id')
  async getProcedure(@Param('id') id: string) {
    return this.proceduresService.getProcedureWithType(+id);
  }

 @Post('renouvellement/start')
async startRenewal(@Body() dto: CreateRenewalDto) {
  return this.proceduresService.startRenewalWithOriginalData(dto.permisId, dto.date_demande,StatutProcedure.EN_COURS);
}

@Post('renouvellement/check-payments')
async checkPayments(@Body() body: { permisId: number }) {
  const { isPaid, missing } = await this.paymentService.checkAllObligationsPaid(body.permisId);
  if (!isPaid) {
    const message = missing
      .map(m => `- ${m.libelle}: ${m.montantRestant.toLocaleString()} DZD`)
      .join('\n');
    
    throw new BadRequestException(
      `Renouvellement bloqué : les paiements suivants sont encore NON PAYÉS :\n${message}`
    );
  }

  return { ok: true };
}



}
