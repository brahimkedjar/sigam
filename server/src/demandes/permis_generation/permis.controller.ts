import { Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { GeneratePermisService } from './permis.service';

@Controller('api/permis')
export class GeneratePermisController {
  constructor(private service: GeneratePermisService) {}

  @Post('generate/:id')
  async generate(@Param('id', ParseIntPipe) id: number) {
    return this.service.generatePermisFromDemande(id);
  }

  @Get('summary/:id')
  async getPdfData(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPermisPdfInfo(id);
  }
}


