export class CreateSeanceDto {
  exercice: number;
  remarques?: string;
  membre_ids: number[];
}

export class UpdateSeanceDto {
  exercice?: number;
  remarques?: string;
  membre_ids?: number[];
}

export class CreateDecisionDto {
  decision_cd: 'favorable' | 'defavorable';
  duree_decision?: number;
  commentaires?: string;
}

export class CreateComiteDto {
  id_seance: number;
  id_procedure: number;
  date_comite: string;
  numero_decision: string;
  objet_deliberation: string;
  resume_reunion: string;
  fiche_technique?: string;
  carte_projettee?: string;
  rapport_police?: string;
  instructeur?: string;
  decisions: CreateDecisionDto[];
}

export class UpdateComiteDto {
  date_comite?: string;
  numero_decision?: string;
  objet_deliberation?: string;
  resume_reunion?: string;
  fiche_technique?: string;
  carte_projettee?: string;
  rapport_police?: string;
  instructeur?: string;
  decisions?: CreateDecisionDto[];
}