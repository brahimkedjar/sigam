import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateWilayaDto {
  @ApiProperty({ description: 'Antenne ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_antenne: number;

  @ApiProperty({ description: 'Wilaya code', example: '16' })
  @IsString()
  @IsNotEmpty()
  code_wilaya: string;

  @ApiProperty({ description: 'Wilaya name', example: 'Alger' })
  @IsString()
  @IsNotEmpty()
  nom_wilaya: string;
}

export class UpdateWilayaDto {
  @ApiProperty({ description: 'Antenne ID', example: 1, required: false })
  @IsNumber()
  @IsNotEmpty()
  id_antenne?: number;

  @ApiProperty({ description: 'Wilaya code', example: '16', required: false })
  @IsString()
  @IsNotEmpty()
  code_wilaya?: string;

  @ApiProperty({ description: 'Wilaya name', example: 'Alger', required: false })
  @IsString()
  @IsNotEmpty()
  nom_wilaya?: string;
}