import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubstanceDto, UpdateSubstanceDto } from './substances.dto';

@Injectable()
export class SubstancesService {
  constructor(private prisma: PrismaService) {}

  async create(createSubstanceDto: CreateSubstanceDto) {
    try {
      return await this.prisma.substance.create({
        data: {
          nom_subFR: createSubstanceDto.nom_subFR,
          nom_subAR: createSubstanceDto.nom_subAR,
          catégorie_sub: createSubstanceDto.catégorie_sub,
          id_redevance: createSubstanceDto.id_redevance || null,
        },
        include: {
          redevance: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create substance');
    }
  }

  async findAll(include?: string) {
    const includeRedevance = include === 'redevance';
    return this.prisma.substance.findMany({
      include: {
        redevance: includeRedevance,
      },
      orderBy: { nom_subFR: 'asc' },
    });
  }

  async findOne(id: number) {
    const substance = await this.prisma.substance.findUnique({
      where: { id_sub: id },
      include: {
        redevance: true,
      },
    });

    if (!substance) {
      throw new NotFoundException(`Substance with ID ${id} not found`);
    }

    return substance;
  }

  async update(id: number, updateSubstanceDto: UpdateSubstanceDto) {
    try {
      return await this.prisma.substance.update({
        where: { id_sub: id },
        data: {
          nom_subFR: updateSubstanceDto.nom_subFR,
          nom_subAR: updateSubstanceDto.nom_subAR,
          catégorie_sub: updateSubstanceDto.catégorie_sub,
          id_redevance: updateSubstanceDto.id_redevance || null,
        },
        include: {
          redevance: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Substance with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to update substance');
    }
  }

  async remove(id: number) {
    try {
      // Check if there are associated demands before deleting
      const associatedDemands = await this.prisma.substanceAssocieeDemande.count({
        where: { id_substance: id },
      });

      if (associatedDemands > 0) {
        throw new BadRequestException(
          'Cannot delete substance with associated demands',
        );
      }

      return await this.prisma.substance.delete({
        where: { id_sub: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Substance with ID ${id} not found`);
      }
      throw error;
    }
  }
}