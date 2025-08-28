// payment.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './create-payment.dto';
import { ObligationResponseDto } from './obligation-response.dto';
import { PaymentResponseDto } from './payment-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { EnumStatutPaiement } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

   async getProcedureWithPermis(procedureId: number) {
    return this.prisma.procedure.findUnique({
      where: { id_proc: procedureId },
      include: {
        permis: {
          select: {
            id: true
          }
        }
      }
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
  const obligation = await this.prisma.obligationFiscale.findUnique({
    where: { id: createPaymentDto.obligationId },
    include: { paiements: true }
  });

  if (!obligation) {
    throw new Error('Obligation not found');
  }

  const totalPaid = obligation.paiements.reduce(
    (sum, payment) => sum + payment.montant_paye, 0
  );
  const remainingAmount = obligation.montant_attendu - totalPaid;

  if (createPaymentDto.amount > remainingAmount) {
    throw new Error(`Payment amount exceeds remaining obligation amount. Maximum allowed: ${remainingAmount}`);
  }

  // Determine payment status based on due date
  const paymentDate = new Date(createPaymentDto.paymentDate);
  const isLate = paymentDate > obligation.date_echeance;
  const paymentStatus = isLate ? 'En retard' : 'Validé';

  const payment = await this.prisma.paiement.create({
    data: {
      id_obligation: createPaymentDto.obligationId,
      montant_paye: createPaymentDto.amount,
      devise: createPaymentDto.currency,
      date_paiement: paymentDate,
      mode_paiement: createPaymentDto.paymentMethod,
      num_quittance: createPaymentDto.receiptNumber,
      etat_paiement: paymentStatus, // Set status based on due date
      justificatif_url: createPaymentDto.proofUrl,
    },
  });

  // Update obligation status if fully paid
  await this.updateObligationStatus(createPaymentDto.obligationId);

  return this.mapToPaymentResponseDto(payment);
}

async getObligationsForPermis(permisId: number): Promise<ObligationResponseDto[]> {
    const obligations = await this.prisma.obligationFiscale.findMany({
      where: { id_permis: permisId },
      include: {
        typePaiement: true,
        paiements: true,
      },
      orderBy: { date_echeance: 'asc' },
    });

    return obligations.map(obligation => this.mapToObligationResponseDto(obligation));
  }

  async getPaymentsForObligation(obligationId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.prisma.paiement.findMany({
      where: { id_obligation: obligationId },
      orderBy: { date_paiement: 'desc' },
    });

    return payments.map(payment => this.mapToPaymentResponseDto(payment));
  }

  async createInitialObligations(permisId: number,procedureId: number) {
  // First check if obligations already exist
  const existingObligations = await this.prisma.obligationFiscale.findMany({
    where: { id_permis: permisId }
  });

  if (existingObligations.length > 0) {
    return existingObligations; // Return existing ones if they exist
  }

  // Only create new obligations if none exist
  const [establishmentFee, surfaceTax, attributionProduct] = await Promise.all([
    this.calculateEstablishmentFee(permisId, procedureId),
    this.calculateSurfaceTax(permisId),
    this.calculateAttributionProduct(permisId,procedureId)
  ]);

  const obligations = [
  {
    id_typePaiement: 1,
    id_permis: permisId,
    annee_fiscale: new Date().getFullYear(),
    montant_attendu: attributionProduct, // ✅ number only
    date_echeance: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    statut: EnumStatutPaiement.A_payer,
  },
  {
    id_typePaiement: 2,
    id_permis: permisId,
    annee_fiscale: new Date().getFullYear(),
    montant_attendu: establishmentFee, // ✅ number only
    date_echeance: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    statut: EnumStatutPaiement.A_payer,
  },
  {
    id_typePaiement: 3,
    id_permis: permisId,
    annee_fiscale: new Date().getFullYear(),
    montant_attendu: surfaceTax, // ✅ number only
    date_echeance: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    statut: EnumStatutPaiement.A_payer,
  },
];

  return this.prisma.obligationFiscale.createMany({
    data: obligations,
  });
}

async getAllObligationsWithDetails(): Promise<ObligationResponseDto[]> {
  const obligations = await this.prisma.obligationFiscale.findMany({
    include: {
      typePaiement: true,
      paiements: true,
      permis: {
        include: {
          detenteur: {
            include: {
              registreCommerce: true
            }
          },
          typePermis: true
        }
      }
    },
    orderBy: { date_echeance: 'asc' }
  });

  return obligations.map(obligation => this.mapToObligationResponseDto(obligation));
}

async getGlobalPaymentSummary() {
  const obligations = await this.prisma.obligationFiscale.findMany({
    include: { 
      paiements: true,
      typePaiement: true 
    }
  });

  const now = new Date();
  const summary = {
    totalDue: 0,
    totalPaid: 0,
    overdueAmount: 0,
    pendingCount: 0,
    totalObligations: obligations.length,
    paidObligations: 0,
    overdueObligations: 0
  };

  obligations.forEach(obligation => {
    const totalPaid = obligation.paiements.reduce(
      (sum, payment) => sum + payment.montant_paye, 0
    );
    
    summary.totalDue += obligation.montant_attendu;
    summary.totalPaid += totalPaid;

    if (totalPaid >= obligation.montant_attendu) {
      summary.paidObligations++;
    } else if (new Date(obligation.date_echeance) < now) {
      summary.overdueObligations++;
      summary.overdueAmount += (obligation.montant_attendu - totalPaid);
    } else {
      summary.pendingCount++;
    }
  });

  return summary;
}

private async updateObligationStatus(obligationId: number) {
  const obligation = await this.prisma.obligationFiscale.findUnique({
    where: { id: obligationId },
    include: { paiements: true }
  });

  if (!obligation) return;

  const totalPaid = obligation.paiements.reduce(
    (sum, payment) => sum + payment.montant_paye, 0
  );

  let newStatus = obligation.statut;
  
  if (totalPaid >= obligation.montant_attendu) {
    newStatus = 'Payé';
  } else if (new Date() > obligation.date_echeance) {
    newStatus = 'En_retard';
  } else {
    newStatus = 'Partiellement_payé';
  }

  await this.prisma.obligationFiscale.update({
    where: { id: obligationId },
    data: { statut: newStatus }
  });
}

/*async getPermisObligationsWithDetails(permisId: number) {
  return this.prisma.obligationFiscale.findMany({
    where: { id_permis: permisId },
    include: {
      typePaiement: true,
      paiements: true,
      permis: {
        include: {
          detenteur: {
            include: {
              registreCommerce: true
            }
          },
          typePermis: true
        }
      }
    },
    orderBy: { date_echeance: 'asc' }
  });
}*/

/*async getPaymentTypes() {
  return this.prisma.typePaiement.findMany({
    include: {
      obligations: {
        include: {
          paiements: true
        }
      }
    }
  });
}*/

  private mapToPaymentResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      amount: payment.montant_paye,
      currency: payment.devise,
      paymentDate: payment.date_paiement,
      paymentMethod: payment.mode_paiement,
      receiptNumber: payment.num_quittance,
      status: payment.etat_paiement,
      proofUrl: payment.justificatif_url,
    };
  }

private mapToObligationResponseDto(obligation: any): ObligationResponseDto {
  return {
    id: obligation.id,
    typePaiement: {
      id: obligation.typePaiement.id,
      libelle: obligation.typePaiement.libelle,
    },
    amount: obligation.montant_attendu,
    fiscalYear: obligation.annee_fiscale,
    dueDate: obligation.date_echeance.toISOString(),
    status: obligation.statut,
    payments: obligation.paiements?.map((p: any) => this.mapToPaymentResponseDto(p)) || [],
    permis: {
      code_permis: obligation.permis?.code_permis || '',
      detenteur: obligation.permis?.detenteur ? {
        id: obligation.permis.detenteur.id_detenteur,
        nom_societeFR: obligation.permis.detenteur.nom_societeFR,
        registreCommerce: obligation.permis.detenteur.registreCommerce ? {
          nif: obligation.permis.detenteur.registreCommerce.nif
        } : undefined
      } : null
    }
  };
}

async calculateEstablishmentFee(permisId: number, procedureId: number) {
  const permis = await this.prisma.permis.findUnique({
    where: { id: permisId },
    include: { typePermis: true },
  });

  if (!permis) throw new Error('Permis not found');

    // 🔑 Get demande from procedure
  const demande = await this.prisma.demande.findFirst({
    where: { id_proc: procedureId },
    include: { typeProcedure: true },
  });

  if (!demande) throw new Error('Demande not found for this procedure');

  const barem = await this.prisma.baremProduitetDroit.findFirst({
    where: {
      typePermisId: permis.typePermis.id,      // from permis
      typeProcedureId: demande.typeProcedure.id, // from demande
    },
  });

  if (!barem) throw new Error('Barem not found');


  if (!barem) throw new Error('Barem not found');

  return barem.montant_droit_etab; 
}





  async calculateSurfaceTax(permisId: number) {
  const permis = await this.prisma.permis.findUnique({
    where: { id: permisId },
    include: { 
      typePermis: {
        include: {
          taxe: true
        }
      } 
    },
  });

  if (!permis) throw new Error('Permis not found');
  if (!permis.superficie) throw new Error('Surface area not defined for this permit');
  if (!permis.typePermis.taxe) throw new Error('Taxe not defined for this permit type');

  const { taxe } = permis.typePermis;
  const superficie = permis.superficie;

  // Calculation formula using values from taxe table
  const taxAmount = (taxe.droit_fixe + (taxe.periode_initiale * superficie)) * 12 / 5;
  return Math.round(taxAmount);
}

  async calculateAttributionProduct(permisId: number, procedureId: number) {
  const permis = await this.prisma.permis.findUnique({
    where: { id: permisId },
    include: { typePermis: true },
  });

  if (!permis) throw new Error('Permis not found');

  // 🔑 Get demande from procedure
  const demande = await this.prisma.demande.findFirst({
    where: { id_proc: procedureId },
    include: { typeProcedure: true },
  });

  if (!demande) throw new Error('Demande not found for this procedure');

  const barem = await this.prisma.baremProduitetDroit.findFirst({
    where: {
      typePermisId: permis.typePermis.id,
      typeProcedureId: demande.typeProcedure.id,
    },
  });

  if (!barem) {
    throw new Error(
      `Barem not found for TypePermis ${permis.typePermis.id} and TypeProcedure ${demande.typeProcedure.id}`
    );
  }

  return barem.produit_attribution;
}



async checkAllObligationsPaid(permisId: number): Promise<{
  isPaid: boolean;
  missing: { libelle: string; montantRestant: number }[];
}> {
  const obligations = await this.getObligationsForPermis(permisId);

  const missing = obligations
    .filter(o => o.status !== 'Payé')
    .map(o => {
      const montantPayé = o.payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        libelle: o.typePaiement.libelle,
        montantRestant: o.amount - montantPayé,
      };
    });

  return {
    isPaid: missing.length === 0,
    missing,
  };
}

async generatePaymentReceipt(paymentId: number) {
  try {

    const payment = await this.prisma.paiement.findUnique({
      where: { id: paymentId },
      include: {
        obligation: {
          include: {
            typePaiement: true,
            permis: {
              include: {
                detenteur: true,
              },
            },
            paiements: true, 
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    const obligation = payment.obligation;

    const receiptsDir = path.resolve(process.cwd(), 'server/public/receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const outputPath = path.join(receiptsDir, `${paymentId}.pdf`);

    const htmlContent = this.buildReceiptHtml({
      obligation,
      payment, // current payment
      payments: obligation?.paiements || [] 
    });

    
try {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
} catch (error) {
  console.error('🛑 Puppeteer PDF generation failed:', error);
  throw error; // Optional: re-throw to let NestJS return 500
}

    return {
      pdfUrl: `http://localhost:3001/receipts/${paymentId}.pdf`,
      paymentDetails: payment,
    };
  } catch (error: any) {
    throw new Error(`Failed to generate receipt: ${error.message}`);
  }
}



    private buildReceiptHtml(data: {
  obligation: any;
  payment: any;
  payments: any[];
}): string {
  const { obligation, payment, payments } = data;

  const detenteurName = obligation?.permis?.detenteur?.nom_societeFR || 'N/A';
  const totalPaid = payments.reduce((sum, p) => sum + (p.montant_paye || 0), 0);
  const type = obligation?.typePaiement?.libelle || 'N/A';

  const paymentRows = payments.map(p => `
    <tr>
      <td>${new Date(p.date_paiement).toLocaleDateString()}</td>
      <td>${(p.montant_paye || 0).toLocaleString()} DZD</td>
      <td>${p.mode_paiement || 'N/A'}</td>
      <td>${p.num_quittance || 'N/A'}</td>
      <td>Validé</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial; padding: 40px; }
        h1 { text-align: center; color: #4CAF50; }
        .label { font-weight: bold; color: #555; }
        .section { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border: 1px solid #ccc; text-align: center; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <h1>Reçu de Paiement</h1>

      <div class="section"><span class="label">Détenteur:</span> ${detenteurName}</div>
      <div class="section"><span class="label">Type de droit:</span> ${type}</div>
      <div class="section"><span class="label">Montant total payé:</span> ${totalPaid.toLocaleString()} DZD</div>

      <h2>Historique des Paiements</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Montant</th>
            <th>Méthode</th>
            <th>Quittance</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
        </tbody>
      </table>

      <div class="footer">Ce reçu a été généré automatiquement. Merci de votre paiement.</div>
    </body>
    </html>
  `;
}


/*async updatePaymentStatus(paymentId: number, status: string) {
  return this.prisma.paiement.update({
    where: { id: paymentId },
    data: { etat_paiement: status },
  });
}*/

/*async getPaymentSummary(permisId: number) {
  const obligations = await this.prisma.obligationFiscale.findMany({
    where: { id_permis: permisId },
    include: { paiements: true }
  });

  const now = new Date();
  const summary = {
    totalObligations: obligations.length,
    paid: 0,
    overdue: 0,
    pending: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  };

  obligations.forEach(obligation => {
    const totalPaid = obligation.paiements.reduce(
      (sum, payment) => sum + payment.montant_paye, 0
    );
    
    summary.totalAmount += obligation.montant_attendu;
    summary.paidAmount += totalPaid;

    if (totalPaid >= obligation.montant_attendu) {
      summary.paid++;
    } else if (obligation.date_echeance < now) {
      summary.overdue++;
      summary.overdueAmount += (obligation.montant_attendu - totalPaid);
    } else {
      summary.pending++;
    }
  });

  return summary;
}
*/

}
