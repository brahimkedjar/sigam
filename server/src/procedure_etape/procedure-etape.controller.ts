
import { Controller, Param, Post, Get, Body } from '@nestjs/common';
import { ProcedureEtapeService } from './procedure-etape.service';
import { StatutProcedure } from '@prisma/client';

@Controller('api/procedure-etape')
export class ProcedureEtapeController {
  constructor(private service: ProcedureEtapeService) {}

 @Post('set/:id_proc/:id_etape')
setCurrent(
  @Param('id_proc') id_proc: string,
  @Param('id_etape') id_etape: string,
) {
  return this.service.setCurrentEtape(+id_proc, +id_etape, true); 
}

// Set a step as "EN_COURS"
@Post('start/:id_proc/:id_etape')
startStep(@Param('id_proc') id_proc: string, @Param('id_etape') id_etape: string ,   @Body('link') link?: string
) {
  return this.service.setStepStatus(+id_proc, +id_etape, StatutProcedure.EN_COURS,link);
}

// Mark a step as "TERMINEE"
// controller
@Post('finish/:id_proc/:id_etape')
finishStep(
  @Param('id_proc') id_proc: string,
  @Param('id_etape') id_etape: string,
) {
  return this.service.setStepStatus(+id_proc, +id_etape, StatutProcedure.TERMINEE);
}




  @Get('current/:id_proc')
  getCurrent(@Param('id_proc') id_proc: string) {
    return this.service.getCurrentEtape(+id_proc);
  }
}
