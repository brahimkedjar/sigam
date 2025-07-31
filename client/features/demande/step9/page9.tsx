// app/demande/step10/page10.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Modal from 'react-modal';
import { FiChevronLeft, FiChevronRight, FiDownload, FiFileText, FiSave } from 'react-icons/fi';
import styles from './permis.module.css';
import Navbar from '../../../features/navbar/Navbar';
import Sidebar from '../../../features/sidebar/Sidebar';
import { BsSave } from 'react-icons/bs';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import { useActivateEtape } from '@/src/hooks/useActivateEtape';
if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

const Step10GeneratePermis = () => {
  const searchParams = useSearchParams();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 8;
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
 useActivateEtape({ idProc, etapeNum: 9, statutProc });

  /*useEffect(() => {
    if (!idProc ) return;
    const activateStep = async () => {
      try {
        await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/9`);
      } catch (err) {
        console.error("Échec de l'activation de l'étape");
      }
    };

    activateStep();
  }, [idProc]);*/



    const handleNext = () => {
    router.push(`/demande/step10/page10?id=${idProc}`);
  };

    const handleBack = () => {
    if (!idProc) {
      setError("ID procédure manquant");
      return;
    }
    router.push(`/demande/step8/page8?id=${idProc}`);
  };

     const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/9`);
    setEtapeMessage("Étape 9 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

 

  const handleSaveToDatabase = async () => {
    try {
      const response = await axios.post(`${apiURL}/api/permis/generate/${idDemande}`);
      alert('✅ Permis enregistré avec succès !');
    } catch (error) {
      console.error('Erreur lors de lenregistrement du permis :', error);
      alert('❌ Erreur lors de lenregistrement du permis.');
    }
  };

  useEffect(() => {
    
    if (!idProc) return;

    axios.get(`${apiURL}/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande?.toString());
        setCodeDemande(res.data.code_demande!);
        setStatutProc(res.data.procedure.statut_proc);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

  useEffect(() => {
  if (!idDemande) return;

  axios.get(`${apiURL}/api/demande/${idDemande}/summary`)
    .then((res) => {
      setData(res.data);
    })
    .catch(err => {
      console.error("Erreur lors de la récupération du résumé de la demande", err);
      setError("Impossible de récupérer les détails du permis");
    });
}, [idDemande]);


  const handleGeneratePermis = () => {
    setShowPDFModal(true);
  };

  const handleDownload = (lang: 'fr' | 'ar') => {
    window.open(`${apiURL}/api/procedure/${idProc}/generate-pdf?lang=${lang}`, '_blank');
  };

  if (!data) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Genaration Permis</span>
          </div>
          <div className={styles['container']}>
                        <div className={styles['content-wrapper']}>
        {/* Progress Steps */}
<ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />
      <h1 className={styles.header}>Génération du Permis</h1>

      <div className={styles.card}>
        <div className={styles.detailItem}>
          <strong>Code permis:</strong> {data.code_demande}
        </div>
        <div className={styles.detailItem}>
          <strong>Type de permis:</strong> {data.typePermis?.lib_type}
        </div>
        <div className={styles.detailItem}>
          <strong>Titulaire:</strong> {data.detenteur?.nom_sociétéFR}
        </div>

        <button
          disabled={statutProc === 'TERMINEE'}
          onClick={handleGeneratePermis}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          <FiFileText className={styles.buttonIcon} /> Générer le Permis
        </button>
      </div>
      
      <button
        onClick={handleSaveToDatabase}
        className={`${styles.button} ${styles.buttonSuccess}`}
        disabled={statutProc === 'TERMINEE' || !statutProc}
      >
        <FiSave className={styles.buttonIcon} /> Enregistrer le permis dans la base
      </button>

      <Modal
        isOpen={showPDFModal}
        onRequestClose={() => setShowPDFModal(false)}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <h2 className={styles.modalHeader}>Choisir la langue du permis</h2>
        <div className={styles.modalButtons}>
          <button
            className={`${styles.modalButton} ${styles.modalButtonFrench}`}
            onClick={() => handleDownload('fr')}
          >
            <FiDownload className={styles.buttonIcon} /> Télécharger en Français
          </button>
          <button
            className={`${styles.modalButton} ${styles.modalButtonArabic}`}
            onClick={() => handleDownload('ar')}
          >
            <FiDownload className={styles.buttonIcon} /> تنزيل بالعربية
          </button>
        </div>
      </Modal>
    </div>
    </div>
    <div className={styles['action-buttons']}>
                <button className={`${styles['btn']} ${styles['btn-outline']}`} onClick={handleBack}>
                  <FiChevronLeft className={styles['btn-icon']} />
                  Précédent
                </button>
                <button
                className={styles['btnSave']}
                onClick={handleSaveEtape}
                disabled={savingEtape || statutProc === 'TERMINEE' || !statutProc}
              >
                <BsSave className={styles['btnIcon']} /> {savingEtape ? "Sauvegarde en cours..." : "Sauvegarder l'étape"}
              </button>
                <button 
                  onClick={handleNext} 
                  className={`${styles['btn']} ${styles['btn-primary']}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles['btn-loading']}>
                      <span className={styles['spinner-small']}></span>
                      Enregistrement...
                    </span>
                  ) : (
                    <>
                      
                      Suivant  <FiChevronRight className={styles['btn-icon']} />
                    </>
                  )}
                </button>
              </div>
              <div className={styles['etapeSaveSection']}>
                {etapeMessage && (
                  <div className={styles['etapeMessage']}>
                    {etapeMessage}
                  </div>
                )}
              </div>
    </main>
    </div></div>
  );
};

export default Step10GeneratePermis;

