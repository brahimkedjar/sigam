'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentForm from './PaymentForm';
import PaymentsTable from './PaymentsTable';
import styles from './Payments.module.css';
import { useSearchParams } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../../sidebar/Sidebar';
import Navbar from '../../navbar/Navbar';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import { STEP_LABELS } from '../../../src/constants/steps';
import router from 'next/router';
import { useActivateEtape } from '@/src/hooks/useActivateEtape';

interface Obligation {
  id: number;
  typePaiement: {
    id: number;
    libelle: string;
  };
  amount: number;
  fiscalYear: number;
  dueDate: string;
  status: string;
  payments: RawPayment[];
}

interface RawPayment {
  id: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
  status: string;
  proofUrl: string | null;
  currency: string;
}



const PaymentPage = () => {
  const searchParams = useSearchParams();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [permisId, setPermisId] = useState<number | null>(null);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentView, navigateTo } = useViewNavigator('nouvelle-demande')
  const currentStep = 9; // 9 for the 10th step (zero-based index)
  const totalSteps = STEP_LABELS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;     
  const statusStyles: Record<string, string> = {
  'Payé': styles.paidStatus,
  'En retard': styles.overdueStatus,
  'Partiellement payé': styles.partialStatus,
  'A payer': styles.pendingStatus,
};
  useActivateEtape({ idProc, etapeNum: 10, statutProc });

const handleTerminerProcedure = async () => {
  if (!idProc) return;
  
  try {
    const res = await axios.put(`${apiURL}/api/procedures/terminer/${idProc}`);
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/10`);
    alert('Procédure terminée avec succès');
    router.push(`/demande/Timeline/Timeline?id=${idProc}`); 
    /*router.push(`/demande/step10/page10?id=${idProc}`);*/
  } catch (err) {
    alert('Erreur lors de la terminaison de la procédure');
    console.error(err);
  }
};

  /*useEffect(() => {
    if (!idProc) return;
    const activateStep = async () => {
      try {
        await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/10`);
      } catch (err) {
        console.error("Échec de l'activation de l'étape");
      }
    };

    activateStep();
  }, [idProc]);*/

    const handleBack = () => {
    if (!idProc) {
      setError("ID procédure manquant");
      return;
    }
    router.push(`/demande/step9/page9?id=${idProc}`);
  };
    
  useEffect(() => {
    if (obligations.length > 0) {
      const total = obligations.reduce((sum, obligation) => {
        return sum + (obligation.amount || 0);
      }, 0);
      setTotalAmount(total);
    }
  }, [obligations]);

  useEffect(() => {
    const initializePayments = async () => {
      if (!idProc) return;

      try {
        setLoading(true);
        const procedureResponse = await axios.get(`${apiURL}/payments/procedures/${idProc}`);

        if (!procedureResponse.data.permis) throw new Error('Aucun permis associé');

        const currentPermisId = procedureResponse.data.permis.id;
        setPermisId(currentPermisId);

        const obligationsResponse = await axios.get(
          `${apiURL}/payments/obligations/${currentPermisId}`
        );

        if (obligationsResponse.data.length === 0) {
          await axios.post(`${apiURL}/payments/initialize/${currentPermisId}`);
          const newObligationsResponse = await axios.get(
            `${apiURL}/payments/obligations/${currentPermisId}`
          );
          setObligations(newObligationsResponse.data);
          setSelectedObligation(newObligationsResponse.data[0]);
        } else {
          setObligations(obligationsResponse.data);
          setSelectedObligation(obligationsResponse.data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Échec de l\'initialisation');
      } finally {
        setLoading(false);
      }
    };

    initializePayments();
  }, [idProc, refreshKey]);

  const fetchPayments = async (obligationId: number) => {
    try {
      const response = await axios.get<RawPayment[]>(
        `${apiURL}/payments/payments/${obligationId}`
      );

      setSelectedObligation((prev) =>
        prev ? { ...prev, payments: response.data } : null
      );

      setObligations((prev) =>
        prev.map((obligation) =>
          obligation.id === obligationId
            ? { ...obligation, payments: response.data }
            : obligation
        )
      );
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique');
    }
  };

  const handleObligationSelect = async (obligation: Obligation) => {
    setSelectedObligation(obligation);
    await fetchPayments(obligation.id);
  };

  useEffect(() => {
    if (!idProc) return;

    axios.get(`${apiURL}/api/procedures/${idProc}/demande`)
      .then(res => {
        setStatutProc(res.data.procedure.statut_proc);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

  const handlePaymentSubmit = async (paymentData: {
    amount: number;
    currency: string;
    paymentDate: string;
    paymentMethod: string;
    receiptNumber: string;
    proofUrl: string;
  }) => {
    try {
      if (!selectedObligation) return;

      await axios.post(`${apiURL}/payments`, {
        ...paymentData,
        obligationId: selectedObligation.id,
      });

      await fetchPayments(selectedObligation.id);

      const obligationsResponse = await axios.get<Obligation[]>(
        `${apiURL}/payments/obligations/${permisId}`
      );

      setObligations(obligationsResponse.data);

      const updated = obligationsResponse.data.find(o => o.id === selectedObligation.id);
      setSelectedObligation(updated || obligationsResponse.data[0]);
    } catch (error) {
      setError('Échec de la soumission du paiement');
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Paiements requis</h1>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Paiements</span>
          </div>
          <div className={styles['container']}>
                        <div className={styles['content-wrapper']}>
                         {/* Progress Steps */}
<div className={styles.progressBar}>
  <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
</div>
      <h1 className={styles.title}>Paiements requis <div className={styles['finalize-button-container']}>
  <button
    onClick={handleTerminerProcedure}
    className={styles['finalize-button']}
    disabled={statutProc === 'TERMINEE' || !statutProc}
  >
    ✅ Terminer la procédure
  </button>
</div></h1>
       

      {loading ? (
        <div className={styles.loading}>Chargement en cours...</div>
      ) : (
        <>
       
          <div className={styles.summarySection}>
            <h2>Résumé des paiements</h2>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>Type de frais</th>
                  <th>Montant (DZD)</th>
                  <th>Référence</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {obligations.map((obligation) => (
                  <tr
                    key={obligation.id}
                    className={selectedObligation?.id === obligation.id ? styles.selectedRow : ''}
                    onClick={() => handleObligationSelect(obligation)}
                  >
                    <td>
                      <strong>{obligation.typePaiement.libelle}</strong>
                      <div className={styles.legalReference}>
                        {getLegalReference(obligation.typePaiement.id)}
                      </div>
                    </td>
                    <td>{obligation.amount.toLocaleString()} DZD</td>
                    <td>
                      {obligation.typePaiement.libelle.substring(0, 2).toUpperCase()}-{obligation.id}
                    </td>
<td>
  <span className={statusStyles[obligation.status]}>
    {obligation.status}
  </span>
</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td colSpan={3}><strong>Total à payer</strong></td>
                  <td><strong>{totalAmount.toLocaleString()} DZD</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.paymentSection}>
            <h2>Saisie des preuves de paiement</h2>
            <p className={styles.instructions}>
              Pour chaque frais, saisissez les informations de paiement reçues du demandeur et uploadez les justificatifs officiels.
              Vérifiez la conformité avant validation.
            </p>

            {selectedObligation && (
              <>
                <div className={styles.obligationHeader}>
                  <h3>
                    {selectedObligation.typePaiement.libelle}
                    <span className={styles.amountDue}>
                      Montant dû: {selectedObligation.amount.toLocaleString()} DZD • Réf: {selectedObligation.typePaiement.libelle.substring(0, 2).toUpperCase()}-{selectedObligation.id}
                    </span>
                  </h3>
                </div>

                <PaymentForm
                  obligation={selectedObligation}
                  onSubmit={handlePaymentSubmit}
                />

                {selectedObligation.payments && selectedObligation.payments.length > 0 && (
                  <PaymentsTable
                    payments={selectedObligation.payments.map((p) => ({
                      id: p.id,
                      date_paiement: p.paymentDate,
                      montant_paye: p.amount,
                      mode_paiement: p.paymentMethod,
                      num_quittance: p.receiptNumber,
                      etat_paiement: p.status,
                      justificatif_url: p.proofUrl,
                    }))}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
      </div>
      <div className={styles['navigation-buttons']}>
                            <button className={`${styles['btn']} ${styles['btn-outline']}`} onClick={handleBack} >
                                <FiChevronLeft className={styles['btn-icon']} />
                                Précédent
                            </button>
                        </div>
    </div>
    </main>
    </div>
    </div>
  );
};

function getLegalReference(paymentTypeId: number): string {
  switch (paymentTypeId) {
    case 1: return 'Article 45 du Code Minier';
    case 2: return 'Article 28 du Code Minier';
    case 3: return 'Article 33 Décret 07-154';
    default: return '';
  }
}

export default PaymentPage;
