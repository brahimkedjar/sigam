import { Controller, Get, Param, ParseIntPipe, Post, Body, Put } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('api')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('procedure/:id_demande/documents')
  async getDocs(@Param('id_demande', ParseIntPipe) id_demande: number) {
    return this.service.getDocumentsByDemande(id_demande);
  }
  
  @Post('demande/:id_demande/dossier-fournis')
  async createOrUpdateDossierFournis(
    @Param('id_demande', ParseIntPipe) id_demande: number,
    @Body() body: { 
      documents: { 
        id_doc: number; 
        status: 'present' | 'manquant'; 
        file_url?: string 
      }[],
      remarques?: string
    }
  ) {
    return this.service.createOrUpdateDossierFournis(
      id_demande, 
      body.documents, 
      body.remarques
    );
  }

 @Put('demande/:id_demande/status')
async updateDemandeStatus(
  @Param('id_demande', ParseIntPipe) id_demande: number,
  @Body() body: { statut_demande: 'ACCEPTEE' | 'REJETEE', motif_rejet?: string }
) {
  return this.service.updateDemandeStatus(
    id_demande,
    body.statut_demande,
    body.motif_rejet
  );
}
}