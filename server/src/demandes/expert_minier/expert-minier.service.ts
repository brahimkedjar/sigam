import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpertDto } from './create-expert.dto';
import { UpdateExpertDto } from './update-expert.dto';
import { ExpertResponseDto } from './expert-response.dto';
import { Readable } from 'stream';

@Injectable()
export class ExpertMinierService {
 
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpertDto: CreateExpertDto): Promise<ExpertResponseDto> {
    const expert = await this.prisma.expertMinier.create({
      data: createExpertDto,
    });
    const result = this.toResponseDto(expert);
    return result;
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

  async importFromCsvSimple(csvData: string): Promise<number> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    let importedCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      try {
        const expertData: CreateExpertDto = {
          nom_expert: row.nom_expert || row.nom || row.name || '',
          fonction: row.fonction || row.function || row.role || '',
          num_registre: row.num_registre || row.registre || row.registration || null,
          organisme: row.organisme || row.organization || row.org || '',
        };

        if (!expertData.nom_expert || !expertData.fonction || !expertData.organisme) {
          continue;
        }

        const existingExpert = await this.prisma.expertMinier.findFirst({
          where: {
            nom_expert: expertData.nom_expert,
            organisme: expertData.organisme,
          },
        });

        if (existingExpert) {
          await this.prisma.expertMinier.update({
            where: { id_expert: existingExpert.id_expert },
            data: expertData,
          });
        } else {
          await this.prisma.expertMinier.create({
            data: expertData,
          });
        }

        importedCount++;
      } catch (error) {
        console.error('Error importing row:', error);
        // Continue with next row
      }
    }
    
    return importedCount;
  }
}




