import { Controller, Post, Get, Body, Put, Param, ParseIntPipe, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { SocieteService } from './societe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionnaireDto } from '../dto/create-actionnaire.dto';

@Controller('api')
export class SocieteController {
  constructor(
    private readonly societeService: SocieteService,
    private readonly prisma: PrismaService
  ) {}

  @Get('statuts-juridiques')
async getAllStatutsJuridiques() {
  return this.prisma.statutJuridique.findMany({
    orderBy: { code_statut: 'asc' }
  });
}

  // Detenteur Morale Endpoints
  @Post('detenteur-morale')
  createDetenteur(@Body() data) {
    return this.societeService.createDetenteur(data);
  }

 @Put('detenteur-morale/:id')
async updateDetenteur(
  @Param('id', ParseIntPipe) id: number,
  @Body() data: any
) {
  // Validate required fields
  if (!data.nom_fr || !data.nom_ar || !parseInt(data.statut_id, 10)) {
    throw new HttpException('Nom FR, Nom AR et Statut sont obligatoires', HttpStatus.BAD_REQUEST);
  }

  return this.societeService.updateDetenteur(id, {
    nom_fr: data.nom_fr,
    nom_ar: data.nom_ar,
    statut_id: parseInt(data.statut_id, 10),
    tel: data.tel || '',
    email: data.email || '',
    fax: data.fax || '',
    adresse: data.adresse || '',
    nationalite: data.nationalite || '',
    pay: data.pay || ''
  });
}

  // Demande Linking
  @Put('demande/:id/link-detenteur')
  async linkDetenteurToDemande(
    @Param('id', ParseIntPipe) id_demande: number,
    @Body('id_detenteur') id_detenteur: number
  ) {
    return this.prisma.demande.update({
      where: { id_demande },
      data: { id_detenteur }
    });
  }

  // Representant Legal Endpoints
  @Post('representant-legal')
  async createRepresentant(@Body() data) {
    if (!data.id_detenteur) {
      throw new HttpException('id_detenteur is required', HttpStatus.BAD_REQUEST);
    }
    const personne = await this.societeService.createPersonne(data);
    return this.societeService.linkFonction(
      personne.id_personne,
      data.id_detenteur,
      'Représentant légal',
      'Actif',
      parseFloat(data.taux_participation)
    );
  }

  @Put('representant-legal/:nin')
  async updateRepresentant(@Param('nin') nin: string, @Body() data: any) {
    if (!data.id_detenteur) {
      throw new HttpException('id_detenteur is required', HttpStatus.BAD_REQUEST);
    }
    return this.societeService.updateRepresentant(nin, data);
  }

  // Registre Commerce Endpoints
  @Post('registre-commerce')
  createRegistre(@Body() data) {
    if (!data.id_detenteur) {
      throw new HttpException('id_detenteur is required', HttpStatus.BAD_REQUEST);
    }
    return this.societeService.createRegistre(data.id_detenteur, data);
  }
@Put('registre-commerce/:id')
updateRegistre(
  @Param('id', ParseIntPipe) id_detenteur: number,
  @Body() data: any
) {
  return this.societeService.updateRegistre(id_detenteur, data);
}

  @Put('actionnaires/:id')
updateActionnaires(
  @Param('id', ParseIntPipe) id_detenteur: number,
  @Body('actionnaires') actionnaires: CreateActionnaireDto[]
) {
  // Validate that each actionnaire has required fields
  for (const [index, actionnaire] of actionnaires.entries()) {    
    if (!actionnaire.id_pays) {
      console.error(`Actionnaire ${index + 1} missing id_pays`);
      throw new HttpException(
        `L'actionnaire ${index + 1} doit avoir un pays sélectionné`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  return this.societeService.updateActionnaires(id_detenteur, actionnaires);
}

  // Actionnaires Endpoints
  @Post('actionnaires')
  createActionnaires(
    @Body('id_detenteur') id_detenteur: number,
    @Body('actionnaires') actionnaires: CreateActionnaireDto[]
  ) {
    return this.societeService.createActionnaires(id_detenteur, actionnaires);
  }



@Delete('actionnaires/:id_detenteur')
async deleteActionnaires(@Param('id_detenteur') id_detenteur: number) {
  return this.societeService.deleteActionnaires(+id_detenteur);
}
}