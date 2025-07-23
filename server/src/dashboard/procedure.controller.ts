// src/procedure/procedure.controller.ts
import { Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/procedures')
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService, private readonly prisma: PrismaService) {}

  // controller: procedure.controller.ts
@Put('terminer/:idProc')
async terminerProcedure(@Param('idProc', ParseIntPipe) idProc: number) {
  return this.procedureService.terminerProcedure(idProc);
}

@Get()
async getAllProcedures() {
  return this.procedureService.getAllProcedures();
}

  @Get('en-cours')
  async getOngoingProcedures() {
    return this.procedureService.getProceduresEnCours();
  }
  @Delete(':id')
  async deleteProcedure(@Param('id') id: string) {
    return this.procedureService.deleteProcedureAndRelatedData(parseInt(id));
  }
 @Get(':id_proc/demande')
async getDemandeByProcedure(@Param('id_proc', ParseIntPipe) id_proc: number) {
  return this.prisma.demande.findFirst({
    where: { id_proc },
    include: {
      detenteur: {
        include: {
          registreCommerce: true,
          fonctions: {
            where: {
              type_fonction: { in: ['Représentant légal', 'Actionnaire'] },
            },
            include: {
              personne: true
            }
          }
        }
      },
      expertMinier: true,
      procedure: {
        include: {
          typeProcedure: true,
          ProcedureEtape: {
            include: {
              etape: true
            },
            orderBy: {
              etape: {
                ordre_etape: 'asc'
              }
            }
          }
        }
      }
    }
  });
}


}
