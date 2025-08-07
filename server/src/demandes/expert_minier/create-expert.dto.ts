import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateExpertDto {
  @IsString()
  @IsNotEmpty()
  nom_expert: string;

  @IsString()
  @IsNotEmpty()
  fonction: string;

  @IsString()
  @IsOptional()
  num_registre?: string;

  @IsString()
  @IsNotEmpty()
  organisme: string;
}