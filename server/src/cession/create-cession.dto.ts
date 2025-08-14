// dto/create-cession.dto.ts
import { IsDateString, IsInt } from 'class-validator';

export class CreateCessionDto {
  @IsInt()
  permisId: number;

  @IsDateString()
  date_demande: string; // format YYYY-MM-DD
}
