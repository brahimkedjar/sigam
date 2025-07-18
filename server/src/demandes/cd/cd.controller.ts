import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ComiteDirectionService } from './cd.service';
import { CreateComiteDto } from '../dto/cd.dto';

@Controller('cd')
export class ComiteDirectionController {
  constructor(private readonly service: ComiteDirectionService) {}

  @Post()
  create(@Body() dto: CreateComiteDto) {
    return this.service.create(dto);
  }

  @Get(':id_procedure')
  getByProc(@Param('id_procedure') id: string) {
    return this.service.getByProcedure(+id);
  }

  @Get()
  getAllMembres() {
    return this.service.getMembresPredefinis();
  }
}
