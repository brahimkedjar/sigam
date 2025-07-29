import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Delete } from '@nestjs/common';
import { CoordonneesService } from './coordonnees.service';

@Controller('coordinates')
export class CoordonneesController {
    prisma: any;
  constructor(private readonly coordonneesService: CoordonneesService) {}
// coordonnees.controller.ts
 @Get('/existing')
  async getExistingPerimeters() {
    return await this.coordonneesService.getExistingPerimeters(); // ✅ Utilisation correcte du service
  }

 @Post()
async createCoordonnees(
  @Body() body: {
    id_proc: number;
    id_zone_interdite: number;
    points: {
      x: string;
      y: string;
      z: string;
    }[];
    statut_coord?: 'NOUVEAU' | 'ANCIENNE';
  }
) {
  return this.coordonneesService.createCoordonnees(
    body.id_proc,
    body.id_zone_interdite,
    body.points,
    body.statut_coord
  );
}

  @Get('/procedure/:id')
async getCoordonneesByProcedure(@Param('id') id_proc: string) {
  try {
    const coords = await this.coordonneesService.getCoordonneesByProcedure(Number(id_proc));
    return coords;
  } catch (error) {
    throw new HttpException('Failed to fetch coordinates', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Delete('/procedure/:id')
async deleteCoordonneesByProcedure(@Param('id') id_proc: string) {
  try {
    return await this.coordonneesService.deleteCoordonneesByProcedure(Number(id_proc));
  } catch (error) {
    throw new HttpException('Failed to delete coordinates', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


@Post('/update')
async updateCoordonnees(
  @Body() body: {
    id_proc: number;
    id_zone_interdite: number;
    points: { x: string; y: string; z: string }[];
    statut_coord?: 'NOUVEAU' | 'ANCIENNE';
    superficie?: number;
  },
) {
  return this.coordonneesService.updateCoordonnees(
    body.id_proc,
    body.id_zone_interdite,
    body.points,
    body.statut_coord,
    body.superficie
  );
}





}
