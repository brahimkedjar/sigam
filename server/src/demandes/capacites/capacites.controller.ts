import { Body, Controller, Post } from '@nestjs/common';
import { CapacitesService } from './capacites.service';

@Controller('api')
export class CapacitesController {
  constructor(private readonly service: CapacitesService) {}

  @Post('capacites')
  saveCapacites(@Body() data: any) {
    return this.service.saveCapacites(data); // ✅ Fixed this line
  }
}

