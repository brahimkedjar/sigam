import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpertDto } from './create-expert.dto';
import { UpdateExpertDto } from './update-expert.dto';
import { ExpertResponseDto } from './expert-response.dto';

@Injectable()
export class ExpertMinierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpertDto: CreateExpertDto): Promise<ExpertResponseDto> {
    const expert = await this.prisma.expertMinier.create({
      data: createExpertDto,
    });
    return this.toResponseDto(expert);
  }

  async findAll(): Promise<ExpertResponseDto[]> {
    const experts = await this.prisma.expertMinier.findMany();
    return experts.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ExpertResponseDto> {
    const expert = await this.prisma.expertMinier.findUnique({
      where: { id_expert: id },
    });
    return this.toResponseDto(expert);
  }

  async update(id: number, updateExpertDto: UpdateExpertDto): Promise<ExpertResponseDto> {
    const updatedExpert = await this.prisma.expertMinier.update({
      where: { id_expert: id },
      data: updateExpertDto,
    });
    return this.toResponseDto(updatedExpert);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.expertMinier.delete({
      where: { id_expert: id },
    });
  }

  private toResponseDto(expert: any): ExpertResponseDto {
    return {
      id_expert: expert.id_expert,
      nom_expert: expert.nom_expert,
      fonction: expert.fonction,
      num_registre: expert.num_registre,
      organisme: expert.organisme,
    };
  }
}