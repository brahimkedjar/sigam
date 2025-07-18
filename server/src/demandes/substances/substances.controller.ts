import { Controller, Post, Body,Get,Query,Param,Delete, ParseIntPipe } from '@nestjs/common';
import { SubstancesService } from './substances.service';
@Controller('api/substances')
export class SubstancesController {
  constructor(private readonly substancesService: SubstancesService) {}

 @Get()
findAll(@Query('famille') famille?: string) {
  return this.substancesService.findAll(famille);
}

  @Get('/demande/:id_demande/substances')
getByDemande(@Param('id_demande', ParseIntPipe) id_demande: number) {
  return this.substancesService.getSelectedByDemande(id_demande);
}

@Get('/demande/:id_demande/substances')
getSubstancesAssociees(@Param('id_demande', ParseIntPipe) id_demande: number) {
  return this.substancesService.getSelectedByDemande(id_demande);
}

  @Get('demande/:id_demande')
  getSelected(@Param('id_demande', ParseIntPipe) id_demande: number) {
    return this.substancesService.getSelectedByDemande(id_demande);
  }

  @Post('demande/:id_demande')
  addToDemande(
    @Param('id_demande', ParseIntPipe) id_demande: number,
    @Body('id_substance') id_substance: number
  ) {
    return this.substancesService.addToDemande(id_demande, id_substance);
  }

  @Delete('demande/:id_demande/:id_substance')
  removeFromDemande(
    @Param('id_demande', ParseIntPipe) id_demande: number,
    @Param('id_substance', ParseIntPipe) id_substance: number
  ) {
    return this.substancesService.removeFromDemande(id_demande, id_substance);
  }
}
