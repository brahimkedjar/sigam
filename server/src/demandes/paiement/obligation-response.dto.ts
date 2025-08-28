// src/payments/dto/obligation-response.dto.ts

import { PaymentResponseDto } from "./payment-response.dto";

// obligation-response.dto.ts
// src/payments/dto.ts
export interface ObligationResponseDto {
  id: number;
  typePaiement: {
    id: number;
    libelle: string;
  };
  amount: number;
  fiscalYear: number;
  dueDate: string;
  status: string;
  payments: PaymentResponseDto[];
  permis: {
    code_permis: string;
    detenteur?: {
      id?: number;
      nom_societeFR: string;
      registreCommerce?: {
        nif: string;
      };
    } | null;
  };
}
