import { GeneratePermisService } from './permis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from './generate_permis_pdf.service';
import { Controller, Get, Param, Post, ParseIntPipe, Query, Body, Res, Delete } from '@nestjs/common';
import { Response } from 'express'; // ✅ add this


@Controller('api/permis')
export class GeneratePermisController {
  constructor( private readonly pdfService: PdfGeneratorService,private service: GeneratePermisService,private readonly prisma: PrismaService
) {}

  @Post('generate/:id')
  async generatePermis(@Param('id') id: string) {
    return this.service.generatePermisFromDemande(parseInt(id));
  }

  @Get('summary/:id')
  async getPdfData(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPermisPdfInfo(id);
  }

   @Post('generate-pdf')
  async generatePdf(@Body() design: any, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generatePdf(design);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=permis-${design.data.code_demande}.pdf`,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }


 @Get('templates')
async getTemplates(
  @Query('permisId') code_permis?: string
) {
  return this.service.getTemplates(
    code_permis ? (code_permis) : undefined
  );
}

  @Post('templates')
async saveTemplate(@Body() body: any) {
  const result = await this.service.saveTemplate(body);
  return result; // Return the full template with id
}

@Delete('templates/:id')
async deleteTemplate(@Param('id') id: string) {
  return this.service.deleteTemplate(id);
}


@Post('save-permis')
async savePermis(@Body() body: any) {
  // First create the permis
  const permis = await this.service.generatePermisFromDemande(body.id_demande);
  
  // Then save the template associated with this specific permis
  if (body.elements) {
    await this.service.saveTemplate({
      elements: body.elements,
      permisId: permis.id,
      name: `Template for ${permis.code_permis}`
    });
  }
  
  return { 
    id: permis.id,
    code_permis: permis.code_permis
  };
}
}