import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { ProcedureRenouvellementService } from './procedure_renouvellemnt.service';
import { CreateRenewalDto } from './create-renouvellement.dto';
import { PaymentService } from 'src/demandes/paiement/payment.service';
import { StatutProcedure } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Controller('api/procedures')
export class ProcedureRenouvellementController {
  constructor(private readonly proceduresService: ProcedureRenouvellementService, private readonly paymentService: PaymentService,private prisma: PrismaService) {}

 
  @Get(':id/renouvellement')
  async getRenewalData(@Param('id') id: string) {
    return this.proceduresService.getRenewalData(+id);
  }

  @Post(':id/renouvellement')
  async createOrUpdateRenewal(
    @Param('id') id: string,
    @Body() renewalData: any
  ) {
    return this.proceduresService.createOrUpdateRenewal(+id, renewalData);
  }

  // procedure_renouvellement.controller.ts
@Get('type/:id/permit-type-details')
async getPermitTypeDetails(@Param('id') id: string) {
  return this.proceduresService.getPermitTypeDetails(+id);
}
    // In your controller
@Get(':id/renewals')
async getPermisRenewals(@Param('id') id: string) {
  return this.proceduresService.getPermisRenewals(+id);
}

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
  // 1. Check payments
  const { isPaid, missing } = await this.paymentService.checkAllObligationsPaid(body.permisId);
  
  // 2. Check renewal count
  const permit = await this.prisma.permis.findUnique({
    where: { id: body.permisId },
    include: {
      typePermis: true,
      procedures: {
        where: {
          typeProcedure: { libelle: 'renouvellement' }
        }
      }
    }
  });

  if (!permit) {
    throw new NotFoundException('Permis non trouvé');
  }

  if (permit.nombre_renouvellements >= permit.typePermis.nbr_renouv_max) {
    throw new BadRequestException(
      `Nombre maximum de renouvellements (${permit.typePermis.nbr_renouv_max}) atteint pour ce permis`
    );
  }

  if (!isPaid) {
    const message = missing
      .map(m => `- ${m.libelle}: ${m.montantRestant.toLocaleString()} DZD`)
      .join('\n');
    
    throw new BadRequestException(
      `Renouvellement bloqué :\n${message}`
    );
  }

  return { 
    ok: true,
    currentRenewals: permit.nombre_renouvellements,
    maxRenewals: permit.typePermis.nbr_renouv_max
  };
}

// In your backend controller
@Get(':id/permis')
async getProcedurePermis(@Param('id') id: string) {
  return this.proceduresService.getPermisForProcedure(+id);
}

}
