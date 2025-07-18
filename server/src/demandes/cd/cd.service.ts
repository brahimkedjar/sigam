import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateComiteDto } from '../dto/cd.dto';

@Injectable()
export class ComiteDirectionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateComiteDto) {
  const {
    membre_ids,
    ...comiteData
  } = dto;

  return this.prisma.comiteDirection.create({
    data: {
      ...comiteData,
      membres: {
        connect: membre_ids.map((id) => ({ id_membre: id }))
      }
    }
  });
}


  async getByProcedure(id_procedure: number) {
    return this.prisma.comiteDirection.findFirst({
      where: { id_procedure },
      include: { membres: true }
    });
  }

  async getMembresPredefinis() {
    return this.prisma.membresComite.findMany();
  }
}

