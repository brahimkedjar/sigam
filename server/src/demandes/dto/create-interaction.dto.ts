export class CreateInteractionDto {
  id_procedure: number;
  type_interaction: "envoi" | "reponse";
  date_interaction: string;
  avis_wali?: "favorable" | "defavorable";
  remarques?: string;
  contenu?: string;
  is_relance?: boolean;
}
