// app/demande/step10/page10.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Modal from 'react-modal';
import { FiCheck, FiChevronLeft, FiChevronRight, FiDownload, FiFileText, FiSave } from 'react-icons/fi';
import styles from './permis.module.css';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { BsSave } from 'react-icons/bs';
import { useViewNavigator } from '@/hooks/useViewNavigator';
import ProgressStepper from '@/components/ProgressStepper';
import { STEP_LABELS } from '@/constants/steps';
if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

const Step10GeneratePermis = () => {
  const searchParams = useSearchParams();
  const idProc = searchParams?.get('id');
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 8;
  
  useEffect(() => {
      const activateStep = async () => {
        if (!idProc) return;
        try {
          await axios.post(`http://localhost:3001/api/procedure-etape/start/${idProc}/9`);
        } catch (err) {
          console.error("Échec de l'activation de l'étape");
        }
      };
    
      activateStep();
    }, [idProc]);


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
    await axios.post(`http://localhost:3001/api/procedure-etape/finish/${idProc}/9`);
    setEtapeMessage("Étape 8 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

 

  const handleSaveToDatabase = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/api/permis/generate/${idDemande}`);
      alert('✅ Permis enregistré avec succès !');
      console.log('Saved permis:', response.data);
    } catch (error) {
      console.error('Erreur lors de lenregistrement du permis :', error);
      alert('❌ Erreur lors de lenregistrement du permis.');
    }
  };

  useEffect(() => {
    if (!idProc) return;

    axios.get(`http://localhost:3001/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande?.toString());
        setCodeDemande(res.data.code_demande!);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

  useEffect(() => {
  if (!idDemande) return;

  axios.get(`http://localhost:3001/api/demande/${idDemande}/summary`)
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
    window.open(`http://localhost:3001/api/procedure/${idProc}/generate-pdf?lang=${lang}`, '_blank');
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
          onClick={handleGeneratePermis}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          <FiFileText className={styles.buttonIcon} /> Générer le Permis
        </button>
      </div>
      
      <button
        onClick={handleSaveToDatabase}
        className={`${styles.button} ${styles.buttonSuccess}`}
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
                disabled={savingEtape}
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

