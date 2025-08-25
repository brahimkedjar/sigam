import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
  InternalServerErrorException,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';   // ✅ Import Express Response
import { ExpertMinierService } from './expert-minier.service';
import { CreateExpertDto } from './create-expert.dto';
import { UpdateExpertDto } from './update-expert.dto';
import { ExpertResponseDto } from './expert-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/experts')
export class ExpertMinierController {
  constructor(private readonly expertService: ExpertMinierService) {}
@Get('export')
  async exportExperts(@Res() res: Response) {
    try {
      const experts = await this.expertService.findAll();

      // Convert to CSV
      const csv = this.convertToCsv(experts);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=experts.csv');
      res.send(csv);  // ✅ Works with Express
    } catch (error) {
      throw new InternalServerErrorException('Error exporting experts');
    }
  }

  private convertToCsv(experts: ExpertResponseDto[]): string {
    const headers = ['ID', 'Nom', 'Fonction', 'Numéro Registre', 'Organisme'];
    const rows = experts.map(expert => [
      expert.id_expert,
      expert.nom_expert,
      expert.fonction,
      expert.num_registre || '',
      expert.organisme,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  @Post()
  create(@Body() createExpertDto: CreateExpertDto): Promise<ExpertResponseDto> {
    const result = this.expertService.create(createExpertDto);
    return result;
  }

  @Get()
  findAll(): Promise<ExpertResponseDto[]> {
    return this.expertService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpertResponseDto> {
    return this.expertService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpertDto: UpdateExpertDto,
  ): Promise<ExpertResponseDto> {
    return this.expertService.update(+id, updateExpertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.expertService.remove(+id);
  }

  
  @Post('import')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
        return cb(new BadRequestException('Only CSV files are allowed'), false);
      }
      cb(null, true);
    },
  }),
)
async importExperts(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  try {
    const csvData = file.buffer.toString('utf-8'); // safer encoding
    const importedCount = await this.expertService.importFromCsvSimple(csvData);

    return { message: `Successfully imported ${importedCount} experts` };
  } catch (error) {
    throw new BadRequestException(
      `Error importing experts: ${error.message || 'Unknown error'}`,
    );
  }
}
}
