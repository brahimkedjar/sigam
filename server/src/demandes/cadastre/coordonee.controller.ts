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
      id_demande: number;
      id_zone_interdite: number;
      points: {
        x: string;
        y: string;
        z: string;
      }[];
    },
  ) {
    return this.coordonneesService.createCoordonnees(
      body.id_demande,
      body.id_zone_interdite,
      body.points,
    );
  }

  @Get('/demande/:id')
async getCoordonneesByDemande(@Param('id') id_demande: string) {
  try {
    const coords = await this.coordonneesService.getCoordonneesByDemande(Number(id_demande));
    return coords;
  } catch (error) {
    throw new HttpException('Failed to fetch coordinates', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Delete('/demande/:id')
async deleteCoordonneesByDemande(@Param('id') id_demande: string) {
  try {
    return await this.coordonneesService.deleteCoordonneesByDemande(Number(id_demande));
  } catch (error) {
    throw new HttpException('Failed to delete coordinates', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Post('/update')
async updateCoordonnees(
  @Body() body: {
    id_demande: number;
    id_zone_interdite: number;
    points: { x: string; y: string; z: string }[];
    superficie?: number; // ✅ Add this line
  },
) {
  return this.coordonneesService.updateCoordonnees(
    body.id_demande,
    body.id_zone_interdite,
    body.points,
    body.superficie // ✅ Pass it to the service
  );
}




}
