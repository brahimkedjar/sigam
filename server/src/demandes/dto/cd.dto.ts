export class CreateComiteDto {
  id_procedure: number;
  date_comite: Date;
  numero_decision: string;
  objet_deliberation: string;
  decision_comite: 'favorable' | 'defavorable';
  resume_reunion: string;
  motif?: string;
  fiche_technique?: string;
  carte_projettee?: string;
  rapport_police?: string;
  instructeur?: string;
  membre_ids: number[]; // <-- utilisé uniquement pour construire le `connect`
}
