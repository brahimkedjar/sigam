import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Res,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { CdService } from './cd.service';
import { 
  CreateSeanceDto, 
  UpdateSeanceDto,
  CreateComiteDto,
  UpdateComiteDto,
  CreateDecisionDto
} from '../dto/cd.dto';
import { Response } from 'express';

@Controller('cd')
export class CdController {
  constructor(private readonly cdService: CdService) {}

  // Seance Endpoints
  @Post('seances')
  async createSeance(@Body() createSeanceDto: CreateSeanceDto) {
    try {
      return await this.cdService.createSeance(createSeanceDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Une séance avec ce numéro existe déjà');
      }
      throw error;
    }
  }

  @Get('seances')
  async getAllSeances() {
    return this.cdService.getSeances();
  }

  @Get('seances/:id')
  async getSeanceById(@Param('id') id: string) {
    const seance = await this.cdService.getSeanceById(parseInt(id));
    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }
    return seance;
  }

  @Put('seances/:id')
  async updateSeance(
    @Param('id') id: string,
    @Body() updateSeanceDto: UpdateSeanceDto
  ) {
    try {
      return await this.cdService.updateSeance(parseInt(id), updateSeanceDto);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Séance non trouvée');
      }
      throw error;
    }
  }

  @Delete('seances/:id')
  async deleteSeance(@Param('id') id: string) {
    try {
      return await this.cdService.deleteSeance(parseInt(id));
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Séance non trouvée');
      }
      throw error;
    }
  }

  // Comite Endpoints
  @Post('comites')
  async createComite(@Body() createComiteDto: CreateComiteDto) {
    try {
      // Check if procedure already has a comité
      const existingComite = await this.cdService.getComitesByProcedure(createComiteDto.id_procedure);
      if (existingComite.length > 0) {
        throw new ConflictException('Cette procédure a déjà un comité associé');
      }

      return await this.cdService.createComite(createComiteDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Un comité avec ce numéro existe déjà');
      }
      throw error;
    }
  }



  @Get('comites/:id')
  async getComiteById(@Param('id') id: string) {
    const comite = await this.cdService.getComiteById(parseInt(id));
    if (!comite) {
      throw new NotFoundException('Comité non trouvé');
    }
    return comite;
  }

  @Put('comites/:id')
  async updateComite(
    @Param('id') id: string,
    @Body() updateComiteDto: UpdateComiteDto
  ) {
    try {
      return await this.cdService.updateComite(parseInt(id), updateComiteDto);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Comité non trouvé');
      }
      throw error;
    }
  }

  @Delete('comites/:id')
  async deleteComite(@Param('id') id: string) {
    try {
      return await this.cdService.deleteComite(parseInt(id));
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Comité non trouvé');
      }
      throw error;
    }
  }

  // Members Endpoints
  @Get('membres')
  async getAllMembres() {
    return this.cdService.getMembres();
  }

  // Report Generation
  @Get('comites/:id/report')
  async generateComiteReport(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const pdfBytes = await this.cdService.generateComiteReport(parseInt(id));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=comite-${id}-report.pdf`
      );
      
      return res.send(pdfBytes);
    } catch (error) {
      if (error.message === 'Comité non trouvé') {
        throw new NotFoundException('Comité non trouvé');
      }
      throw error;
    }
  }

@Get('comites/seance/:seanceId/procedure/:procedureId')
async getComiteBySeanceAndProcedure(
  @Param('seanceId') seanceId: string,
  @Param('procedureId') procedureId: string
) {
  const comite = await this.cdService.getComiteBySeanceAndProcedure(
    parseInt(seanceId),
    parseInt(procedureId)
  );
  if (!comite) {
    throw new NotFoundException('Comité non trouvé');
  }
  return comite;
}

@Get('seances-with-comite/:procedureId')
async getSeancesWithComite(@Param('procedureId') procedureId: string) {
  return this.cdService.getSeancesWithComite(parseInt(procedureId));
}

@Get('comites/procedure/:procedureId')
async getComitesByProcedure(@Param('procedureId') procedureId: string) {
  const comites = await this.cdService.getComitesByProcedure(parseInt(procedureId));
  if (!comites || comites.length === 0) {
    throw new NotFoundException('No comités found for this procedure');
  }
  return comites;
}
}