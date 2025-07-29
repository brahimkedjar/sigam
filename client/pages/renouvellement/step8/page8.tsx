// app/demande/renouvellement/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Modal from 'react-modal';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiSave, 
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import styles from './page8.module.css';
import Sidebar from "../../sidebar/Sidebar";
import Navbar from "../../navbar/Navbar";
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { useActivateEtape } from '@/hooks/useActivateEtape';
import { STEP_LABELS } from '@/constants/steps';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

type RenewalData = {
  nombre_renouvellement: number;
  num_decision: string;
  date_decision: string;
  date_debut_validite: string;
  date_fin_validite: string;
  commentaire: string;
  duree_renouvellement: number;
};

type PermitDetails = {
  code_permis: string;
  typePermis: string;
  detenteur: string;
  date_expiration: string;
  currentStatus: string;
};

const PermitRenewalPage = () => {
  const searchParams = useSearchParams();
  const originalIdStr = searchParams?.get("originalDemandeId");
  const originalProcIdStr = searchParams?.get("original_proc_id");
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const router = useRouter();
  const [permitDetails, setPermitDetails] = useState<PermitDetails | null>(null);
  const [renewalData, setRenewalData] = useState<RenewalData>({
    nombre_renouvellement: 0,
    num_decision: '',
    date_decision: '',
    date_debut_validite: '',
    date_fin_validite: '',
    commentaire: '',
    duree_renouvellement: 1 // Default to 1 year
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 3; // Assuming renewal is step 3 in the process
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 3, statutProc });

  useEffect(() => {
    if (!idProc) return;

    const fetchProcedureData = async () => {
      try {
        const [procedureRes, renewalRes] = await Promise.all([
          axios.get(`${apiURL}/api/procedures/${idProc}`),
          axios.get(`${apiURL}/api/procedures/${idProc}/renouvellement`)
        ]);

        const procedureData = procedureRes.data;
        setStatutProc(procedureData.statut_proc);

        if (procedureData.permis && procedureData.permis.length > 0) {
          const permit = procedureData.permis[0];
          setPermitDetails({
            code_permis: permit.code_permis,
            typePermis: permit.typePermis.lib_type,
            detenteur: permit.detenteur?.nom_sociétéFR || 'N/A',
            date_expiration: permit.date_expiration,
            currentStatus: permit.statut?.lib_statut || 'N/A'
          });
        }

        if (renewalRes.data) {
          setRenewalData(prev => ({
            ...prev,
            nombre_renouvellement: renewalRes.data.nombre_renouvellement + 1,
            ...renewalRes.data
          }));
        } else {
          setRenewalData(prev => ({
            ...prev,
            nombre_renouvellement: 1
          }));
        }
      } catch (err) {
        console.error("Failed to fetch procedure data:", err);
        setError("Failed to load procedure data");
      }
    };

    fetchProcedureData();
  }, [idProc]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRenewalData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const duration = parseInt(e.target.value);
    setRenewalData(prev => ({
      ...prev,
      duree_renouvellement: duration
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof RenewalData)[] = ['num_decision', 'date_decision', 'duree_renouvellement'];

    requiredFields.forEach(field => {
      if (!renewalData[field]) {
        errors[field] = 'Ce champ est obligatoire';
      }
    });

    if (renewalData.duree_renouvellement <= 0) {
      errors.duree_renouvellement = 'La durée doit être positive';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateNewDates = () => {
    if (!permitDetails?.date_expiration || !renewalData.duree_renouvellement) return;

    const startDate = new Date(permitDetails.date_expiration);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + renewalData.duree_renouvellement);

    setRenewalData(prev => ({
      ...prev,
      date_debut_validite: startDate.toISOString().split('T')[0],
      date_fin_validite: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!idProc) {
      setError("ID procedure missing");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(`${apiURL}/api/procedures/${idProc}/renouvellement`, {
        ...renewalData,
        date_decision: new Date(renewalData.date_decision).toISOString(),
        date_debut_validite: new Date(renewalData.date_debut_validite).toISOString(),
        date_fin_validite: new Date(renewalData.date_fin_validite).toISOString()
      });

      setSuccess("Renouvellement enregistré avec succès!");
      setShowConfirmation(false);
      
      // Update permit status to "Renouvelé"
      await axios.patch(`${apiURL}/api/permis/${response.data.id_permis}/status`, {
        status: "renouvellé"
      });

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Renewal submission error:", err);
      setError("Erreur lors de l'enregistrement du renouvellement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push(`/demande/renouvellement/step4?id=${idProc}`);
  };

  const handleBack = () => {
    router.push(`/demande/renouvellement/step2?id=${idProc}`);
  };

  const handleSaveEtape = async () => {
    if (!idProc) {
      setError("ID procedure manquant !");
      return;
    }

    try {
      await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/3`);
      setSuccess("Étape enregistrée avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur étape", err);
      setError("Erreur lors de l'enregistrement de l'étape");
    }
  };

  if (!permitDetails) {
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
                {/* Current Permit Details */}
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

                {/* Renewal Form */}
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
                      <label htmlFor="duree_renouvellement">Durée du renouvellement (années)</label>
                      <select
                        id="duree_renouvellement"
                        name="duree_renouvellement"
                        value={renewalData.duree_renouvellement}
                        onChange={handleDurationChange}
                        className={validationErrors.duree_renouvellement ? styles.errorInput : ''}
                      >
                        {[1, 2, 3, 4, 5].map(year => (
                          <option key={year} value={year}>
                            {year} {year > 1 ? 'ans' : 'an'}
                          </option>
                        ))}
                      </select>
                      {validationErrors.duree_renouvellement && (
                        <span className={styles.errorMessage}>{validationErrors.duree_renouvellement}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="date_debut_validite">Nouvelle date de début</label>
                      <input
                        type="date"
                        id="date_debut_validite"
                        name="date_debut_validite"
                        value={renewalData.date_debut_validite}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="date_fin_validite">Nouvelle date d'expiration</label>
                      <input
                        type="date"
                        id="date_fin_validite"
                        name="date_fin_validite"
                        value={renewalData.date_fin_validite}
                        onChange={handleChange}
                        disabled
                      />
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

          {/* Navigation buttons */}
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

          {/* Confirmation Modal */}
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
                  {renewalData.duree_renouvellement} {renewalData.duree_renouvellement > 1 ? 'ans' : 'an'}
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

          {/* Status messages */}
          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle /> {error}
            </div>
          )}
          {success && (
            <div className={styles.successMessage}>
              <FiCheckCircle /> {success}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PermitRenewalPage;