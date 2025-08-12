// comites/comite.controller.ts
import { Controller, Post, Put, Param, Body } from '@nestjs/common';
import { ComiteService } from './comite.service';
import { CreateComiteDto } from '../dto/create-comite.dto';

@Controller('api/comites')
export class ComiteController {
  constructor(private readonly comiteService: ComiteService) {}

  @Post()
  async createComite(@Body() createComiteDto: CreateComiteDto) {
    return this.comiteService.createComite(createComiteDto);
  }

  @Put(':id')
  async updateComite(
    @Param('id') id: string,
    @Body() updateComiteDto: CreateComiteDto
  ) {
    return this.comiteService.updateComite(+id, updateComiteDto);
  }
}