import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ExpertMinierService } from './expert-minier.service';
import { CreateExpertDto } from './create-expert.dto';
import { UpdateExpertDto } from './update-expert.dto';
import { ExpertResponseDto } from './expert-response.dto';

@Controller('api/experts')
export class ExpertMinierController {
  constructor(private readonly expertService: ExpertMinierService) {}

  @Post()
  create(@Body() createExpertDto: CreateExpertDto): Promise<ExpertResponseDto> {
    return this.expertService.create(createExpertDto);
  }

  @Get()
  findAll(): Promise<ExpertResponseDto[]> {
    return this.expertService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpertResponseDto> {
    return this.expertService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpertDto: UpdateExpertDto,
  ): Promise<ExpertResponseDto> {
    return this.expertService.update(+id, updateExpertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.expertService.remove(+id);
  }
}