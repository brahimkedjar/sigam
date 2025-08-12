// dto/create-comite.dto.ts
export class CreateComiteDto {
  id_seance: number;
  date_comite: Date;
  numero_decision: string;
  objet_deliberation: string;
  resume_reunion: string;
  fiche_technique?: string;
  carte_projettee?: string;
  rapport_police?: string;
  instructeur?: string;
}