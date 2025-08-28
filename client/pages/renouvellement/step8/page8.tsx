'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiSave, 
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import styles from './page8.module.css';
import Sidebar from "../../sidebar/Sidebar";
import Navbar from "../../navbar/Navbar";
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { useActivateEtape } from '@/src/hooks/useActivateEtape';
import { STEP_LABELS } from '@/src/constants/steps';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

type RenewalData = {
  nombre_renouvellements: number;
  num_decision: string;
  date_decision: string;
  date_debut_validite: string;
  date_fin_validite: string;
  commentaire: string;
  duree_renouvellement: number;
};

interface PermitDetails {
  code_permis: string;
  typePermis: string;
  detenteur: string;
  date_expiration: string;
  currentStatus: string;
  id_typePermis?: number;
}

interface PermitTypeDetails {
  duree_renouv: number;
  nbr_renouv_max: number;
}
const PermitRenewalPage = () => {
  const searchParams = useSearchParams();
  const originalIdStr = searchParams?.get("originalDemandeId");
  const originalProcIdStr = searchParams?.get("original_proc_id");
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const originalId = originalIdStr ? parseInt(originalIdStr, 10) : undefined;
  const router = useRouterWithLoading();
  const [permitDetails, setPermitDetails] = useState<PermitDetails | null>(null);
  const [permitTypeDetails, setPermitTypeDetails] = useState<PermitTypeDetails | null>(null);
  const [renewalData, setRenewalData] = useState<RenewalData>({
    nombre_renouvellements: 0,
    num_decision: '',
    date_decision: '',
    date_debut_validite: '',
    date_fin_validite: '',
    commentaire: '',
    duree_renouvellement: 1
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 7;
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 8, statutProc });

  useEffect(() => {
  if (permitDetails && permitTypeDetails) {
    calculateNewDates();
  }
}, [permitDetails, permitTypeDetails]);


  useEffect(() => {
    if (!idProc) return;

    const fetchProcedureData = async () => {
      try {
        const [procedureRes, renewalRes] = await Promise.all([
          axios.get(`${apiURL}/api/procedures/${idProc}`),
          axios.get(`${apiURL}/api/procedures/${idProc}/renouvellement`)
            .catch(() => ({ data: null })),
        ]);

        const procedureData = procedureRes.data;
        setStatutProc(procedureData.statut_proc);

        const permit = renewalRes.data?.permis || procedureData.permis?.[0];
        
        if (permit) {
          setPermitDetails({
            code_permis: permit.code_permis,
            typePermis: permit.typePermis?.lib_type || 'N/A',
            detenteur: permit.detenteur?.nom_societeFR || 'N/A',
            date_expiration: permit.date_expiration,
            currentStatus: permit.statut?.lib_statut || 'N/A',
            id_typePermis: permit.id_typePermis
          });

          // Fetch permit type details
          if (permit.id_typePermis) {
            const typeRes = await axios.get(
  `${apiURL}/api/procedures/type/${permit.id_typePermis}/permit-type-details`
);

setPermitTypeDetails({
  duree_renouv: typeRes.data.duree_renouv,
  nbr_renouv_max: typeRes.data.nbr_renouv_max
});

// Set the default duration value
setRenewalData(prev => ({
  ...prev,
  duree_renouvellement: typeRes.data.duree_renouv
}));
          }
        }

        if (renewalRes.data) {
          setRenewalData({
            num_decision: renewalRes.data.num_decision || '',
            date_decision: renewalRes.data.date_decision || '',
            date_debut_validite: renewalRes.data.date_debut_validite || '',
            date_fin_validite: renewalRes.data.date_fin_validite || '',
            commentaire: renewalRes.data.commentaire || '',
            duree_renouvellement: renewalRes.data.duree_renouvellement || 1,
            nombre_renouvellements: renewalRes.data.permis.nombre_renouvellements,
          });
        }
      } catch (err) {
        console.error("Failed to fetch procedure data:", err);
        toast.error("Échec du chargement des données du permis");
      }
    };

    fetchProcedureData();
  }, [idProc]);

  const generateDurationOptions = (maxDuration: number) => {
    const options = [];
    // Add half-year option if applicable
    if (maxDuration >= 0.5) options.push(0.5);
    
    // Add yearly options up to max duration
    for (let i = 1; i <= maxDuration; i++) {
      options.push(i);
    }
    return options;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRenewalData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const duration = parseFloat(e.target.value);
    setRenewalData(prev => ({
      ...prev,
      duree_renouvellement: duration
    }));
  };

  const validateForm = () => {
  const errors: Record<string, string> = {};
  const requiredFields: (keyof RenewalData)[] = ['num_decision', 'date_decision'];
  // Removed duree_renouvellement from required fields since it's fixed

  requiredFields.forEach(field => {
    if (!renewalData[field]) {
      errors[field] = 'Ce champ est obligatoire';
    }
  })
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  const calculateNewDates = () => {
  if (!permitDetails?.date_expiration || !permitTypeDetails?.duree_renouv) return;

  const expirationDate = new Date(permitDetails.date_expiration);
  const endDate = new Date(expirationDate);
  
  // Calculate end date based on permit type's fixed duration
  if (permitTypeDetails.duree_renouv === 0.5) {
    endDate.setMonth(endDate.getMonth() + 6);
  } else {
    endDate.setFullYear(endDate.getFullYear() + permitTypeDetails.duree_renouv);
  }

  setRenewalData(prev => ({
    ...prev,
    date_debut_validite: expirationDate.toISOString().split('T')[0], // Set to current expiration date
    date_fin_validite: endDate.toISOString().split('T')[0]
  }));
};


  const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!idProc || !permitDetails) {
    toast.error("Données du permis manquantes");
    return;
  }

  setIsSubmitting(true);

  try {
    // 1. Submit renewal data
    await axios.post(`${apiURL}/api/procedures/${idProc}/renouvellement`, {
      ...renewalData,
      date_decision: new Date(renewalData.date_decision).toISOString(),
      date_debut_validite: new Date(renewalData.date_debut_validite).toISOString(),
      date_fin_validite: new Date(renewalData.date_fin_validite).toISOString(),
      duree_renouvellement: renewalData.duree_renouvellement
    });

    // 2. Fetch updated procedure data
    const procedureRes = await axios.get(`${apiURL}/api/procedures/${idProc}`);
    console.log('Full API Response:', procedureRes.data);

    // 3. NEW: Get permit data from the correct path
    // First try the new endpoint for permit data
    let updatedPermit;
    try {
      const permitRes = await axios.get(`${apiURL}/api/procedures/${idProc}/permis`);
      updatedPermit = permitRes.data;
    } catch (permisError) {
      console.warn('Could not fetch permit directly, falling back to procedure data');
      updatedPermit = procedureRes.data.permis?.[0] || procedureRes.data;
    }

    // 4. Validate we have the required data
    if (!updatedPermit?.date_expiration) {
      console.error('Permit data missing expiration:', updatedPermit);
      throw new Error("Données de permis incomplètes - date d'expiration manquante");
    }

    // 5. Update state
    setPermitDetails(prev => ({
      ...prev!,
      date_expiration: updatedPermit.date_expiration
    }));

    toast.success("Renouvellement enregistré avec succès!");
    setShowConfirmation(false);

  } catch (err) {
    console.error("Full error details:", err);
    const errorMessage = err instanceof Error ? err.message : "Erreur technique";
    toast.error(`Échec du renouvellement: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};
  const handleNext = () => {
    router.push(`/renouvellement/step9/page9?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalIdStr}`);
  };

  const handleBack = () => {
    router.push(`/renouvellement/step7/page7?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalIdStr}`);
  };

  const handleSaveEtape = async () => {
    if (!idProc) {
      toast.error("ID procedure manquant");
      return;
    }

    try {
      await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/8`);
      toast.success("Étape 8 enregistrée avec succès");
    } catch (err) {
      console.error("Erreur étape", err);
      toast.error("Erreur lors de l'enregistrement de l'étape");
    }
  };

  if (!permitDetails || !permitTypeDetails) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des détails du permis...</p>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.appContent}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles.mainContent}>
          <div className={styles.breadcrumb}>
            <span>SIGAM</span>
            <FiChevronRight className={styles.breadcrumbArrow} />
            <span>Renouvellement de permis</span>
          </div>

          <div className={styles.contentWrapper}>
            <ProgressStepper
              steps={
                originalIdStr
                  ? STEP_LABELS.filter((step) => step !== "Avis Wali")
                  : STEP_LABELS
              }
              currentStep={currentStep}
            />

            <div className={styles.renewalContainer}>
              <header className={styles.header}>
                <h1>Renouvellement du Permis Minier</h1>
                <p className={styles.subtitle}>Prolongation de la validité du permis existant</p>
              </header>

              <div className={styles.renewalGrid}>
                <section className={styles.permitDetails}>
                  <div className={styles.detailCard}>
                    <h2>
                      <FiFileText /> Détails du permis actuel
                    </h2>
                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <strong>Code permis:</strong> {permitDetails.code_permis}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Type:</strong> {permitDetails.typePermis}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Titulaire:</strong> {permitDetails.detenteur}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Date d'expiration:</strong> {new Date(permitDetails.date_expiration).toLocaleDateString()}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Statut actuel:</strong> 
                        <span className={`${styles.statusBadge} ${permitDetails.currentStatus === 'Actif' ? styles.active : styles.pending}`}>
                          {permitDetails.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.renewalForm}>
                  <div className={styles.formCard}>
                    <h2>
                      <FiCalendar /> Détails du renouvellement
                    </h2>

                    <div className={styles.formGroup}>
                      <label htmlFor="num_decision">Numéro de décision</label>
                      <input
                        type="text"
                        id="num_decision"
                        name="num_decision"
                        value={renewalData.num_decision}
                        onChange={handleChange}
                        className={validationErrors.num_decision ? styles.errorInput : ''}
                      />
                      {validationErrors.num_decision && (
                        <span className={styles.errorMessage}>{validationErrors.num_decision}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="date_decision">Date de décision</label>
                      <input
                        type="date"
                        id="date_decision"
                        name="date_decision"
                        value={renewalData.date_decision}
                        onChange={handleChange}
                        className={validationErrors.date_decision ? styles.errorInput : ''}
                      />
                      {validationErrors.date_decision && (
                        <span className={styles.errorMessage}>{validationErrors.date_decision}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
  <label htmlFor="duree_renouvellement">Durée du renouvellement</label>
  <div className={styles.durationDisplay}>
    {permitTypeDetails?.duree_renouv === 0.5 ? '6 mois' : `${permitTypeDetails?.duree_renouv} an${permitTypeDetails?.duree_renouv > 1 ? 's' : ''}`}
  </div>
  <input
    type="hidden"
    name="duree_renouvellement"
    value={permitTypeDetails?.duree_renouv || 1}
  />
  <div className={styles.durationInfo}>
    <FiInfo /> Durée maximale autorisée: {permitTypeDetails?.duree_renouv} an(s) | 
    Renouvellements restants: {permitTypeDetails?.nbr_renouv_max - renewalData.nombre_renouvellements}
  </div>
</div>
                    <div className={styles.formGroup}>
  <label htmlFor="date_debut_validite">Nouvelle date de début</label>
  <input
    type="date"
    id="date_debut_validite"
    name="date_debut_validite"
    value={renewalData.date_debut_validite}
    readOnly
    className={styles.readOnlyInput}
  />
  <div className={styles.dateInfo}>
    Correspond à la date d'expiration actuelle du permis
  </div>
</div>

<div className={styles.formGroup}>
  <label htmlFor="date_fin_validite">Nouvelle date d'expiration</label>
  <input
    type="date"
    id="date_fin_validite"
    name="date_fin_validite"
    value={renewalData.date_fin_validite}
    readOnly
    className={styles.readOnlyInput}
  />
  <div className={styles.dateInfo}>
    {permitTypeDetails?.duree_renouv === 0.5 
      ? '6 mois après la date d\'expiration actuelle'
      : `${permitTypeDetails?.duree_renouv} an(s) après la date d'expiration actuelle`
    }
  </div>
</div>
                    <div className={styles.formGroup}>
                      <label htmlFor="commentaire">Commentaires (optionnel)</label>
                      <textarea
                        id="commentaire"
                        name="commentaire"
                        value={renewalData.commentaire}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    <div className={styles.formActions}>
                      <button
                        className={styles.calculateButton}
                        onClick={calculateNewDates}
                        disabled={!renewalData.duree_renouvellement || !permitDetails.date_expiration}
                      >
                        Calculer les nouvelles dates
                      </button>

                      <button
                        className={styles.submitButton}
                        onClick={() => setShowConfirmation(true)}
                        disabled={!renewalData.date_fin_validite || isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className={styles.buttonLoading}>
                            <span className={styles.spinner}></span>
                            Enregistrement...
                          </span>
                        ) : (
                          <>
                            <FiSave /> Enregistrer le renouvellement
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className={styles.navigationButtons}>
            <button className={styles.backButton} onClick={handleBack}>
              <FiChevronLeft /> Précédent
            </button>
            <button className={styles.saveButton} onClick={handleSaveEtape}>
              <FiSave /> Sauvegarder l'étape
            </button>
            <button 
              className={styles.nextButton} 
              onClick={handleNext}
              disabled={!renewalData.date_fin_validite || isSubmitting}
            >
              Suivant <FiChevronRight />
            </button>
          </div>

          <Modal
            isOpen={showConfirmation}
            onRequestClose={() => setShowConfirmation(false)}
            className={styles.modal}
            overlayClassName={styles.modalOverlay}
          >
            <div className={styles.modalContent}>
              <h2>
                <FiAlertCircle /> Confirmer le renouvellement
              </h2>
              <p>Vous êtes sur le point de renouveler le permis <strong>{permitDetails.code_permis}</strong>.</p>
              
              <div className={styles.confirmationDetails}>
                <div className={styles.confirmationItem}>
                  <strong>Nouvelle date d'expiration:</strong> 
                  {new Date(renewalData.date_fin_validite).toLocaleDateString()}
                </div>
                <div className={styles.confirmationItem}>
                  <strong>Durée:</strong> 
                  {renewalData.duree_renouvellement === 0.5 ? '6 mois' : `${permitTypeDetails?.duree_renouv} an(s)`}
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button 
                  className={styles.modalCancel}
                  onClick={() => setShowConfirmation(false)}
                >
                  Annuler
                </button>
                <button 
                  className={styles.modalConfirm}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </Modal>
          <ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>
        </main>
      </div>
    </div>
  );
};

export default PermitRenewalPage;