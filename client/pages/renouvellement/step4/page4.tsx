'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDemandeInfo } from '../../../utils/useDemandeInfo';
import { FiChevronLeft, FiChevronRight, FiUser, FiDollarSign, FiTool, FiFileText, FiCalendar } from 'react-icons/fi';
import styles from '../../demande/step4/capacites.module.css';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import { BsSave } from 'react-icons/bs';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import { useActivateEtape } from '@/hooks/useActivateEtape';

export default function Capacites() {
  const [form, setForm] = useState({
    duree_travaux: '',
    capital_social: '',
    budget: '',
    description: '',
    financement: '',
    nom_expert: '',
    fonction: '',
    num_registre: '',
    organisme: '',
    date_demarrage_prevue:''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isReady } = useDemandeInfo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const originalId  = searchParams?.get("originalDemandeId");
  const originalprocid  = searchParams?.get("original_proc_id");
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const currentStep = 3;    
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 4, statutProc });


  useEffect(() => {
  const proc = searchParams?.get('id');

  if (proc) {
    axios.get(`${apiURL}/api/procedures/${originalprocid}/demande`)
      .then(res => {
        const demande = res.data;
        setIdDemande(demande.id_demande.toString());
        setCodeDemande(demande.code_demande);
        /*setStatutProc(res.data.procedure.statut_proc);*/
        setForm({
  duree_travaux: demande.duree_travaux_estimee || '',
  capital_social: demande.capital_social_disponible || '',
  budget: demande.budget_prevu || '',
  description: demande.description_travaux || '',
  financement: demande.sources_financement || '',
  nom_expert: demande.expertMinier?.nom_expert || '',
  fonction: demande.expertMinier?.fonction || '',
  num_registre: demande.expertMinier?.num_registre || '',
  organisme: demande.expertMinier?.organisme || '',
  date_demarrage_prevue: demande.date_demarrage_prevue?.split('T')[0] || ''
});


      })
      .catch(err => {
        console.error("Erreur récupération de la demande :", err);
        setError("Erreur récupération de la demande");
      });
  }
}, [searchParams]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/4`);
    setEtapeMessage("Étape 4 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};


  const handleNext = async () => {
    if (!idProc) {
      setError("Identifiant de la procedure manquant");
      return;
    }

    if (!form.nom_expert || !form.fonction || !form.organisme) {
      setError("Veuillez remplir le nom de l'expert, la fonction et l'organisme");
      return;
    }

    try {
     await axios.post(`${apiURL}/api/capacites`, {
  id_demande: idDemande,
  duree_travaux: form.duree_travaux,
  capital_social: form.capital_social,
  budget: form.budget,
  description: form.description,
  financement: form.financement,
  nom_expert: form.nom_expert,
  fonction: form.fonction,
  num_registre: form.num_registre,
  organisme: form.organisme,
  date_demarrage_prevue: form.date_demarrage_prevue 

});


      setSuccess("Expert minier enregistré avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'expert", error);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
    if (!idProc) {
      setError("Informations de la demande manquantes");
      return;
    }
         router.push(`/renouvellement/step5/page5?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalprocid}`);
  };

   const handleBack = () => {
  if (!idProc) {
    setError("ID procédure manquant");
    return;
  }
      router.push(`/renouvellement/step3/page3?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalprocid}`);
};

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des informations de la demande...</p>
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
          <span>Capacitiés</span>
        </div>
        <div className={styles.capacitesContainer}>
                    <div className={styles.contentWrapper}>

          {/* Progress Steps */}
            <ProgressStepper
  steps={
    originalprocid
      ? STEP_LABELS.filter((step) => step !== "Avis Wali")
      : STEP_LABELS
  }
  currentStep={currentStep}
/>

            <h2 className={styles.pageTitle}>
              <span className={styles.stepNumber}>Étape 3</span>
              Capacités techniques et financières
            </h2>

            {codeDemande && idDemande && (
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <h4 className={styles.infoTitle}>
                    <FiFileText className={styles.infoIcon} />
                    Informations Demande
                  </h4>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Code Demande :</span>
                    <span className={styles.infoValue}>{codeDemande}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ID Demande :</span>
                    <span className={styles.infoValue}>{idDemande}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formSections}>
              {/* Capacités Techniques Section */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiTool className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Capacités techniques</h3>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Durée estimée des travaux (mois)</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="duree_travaux"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.duree_travaux}
                      placeholder="Ex: 24"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Capital social disponible</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="capital_social"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.capital_social}
                      placeholder="Ex: 500 000 DZD"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Budget prévu</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="budget"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.budget}
                      placeholder="Ex: 2 000 000 DZD"
                    />
                  </div>
                  <div className={styles.formGroup}>
  <label className={styles.formLabel}>
    <FiCalendar className={styles.inputIcon} />
    Date de Début Prévue
  </label>
  <input
  disabled={statutProc === 'TERMINEE'}
  type="date"
  name="date_demarrage_prevue"
    className={styles.formInput}

  value={form.date_demarrage_prevue}
  onChange={handleChange}
/>
</div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Description des travaux techniques</label>
                    <textarea
                    disabled={statutProc === 'TERMINEE'}
                      name="description"
                      className={styles.formTextarea}
                      onChange={handleChange}
                      value={form.description}
                      placeholder="Décrivez les travaux techniques prévus..."
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* Capacités Financières Section */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiDollarSign className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Capacités financières</h3>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sources de financement</label>
                  <textarea
                  disabled={statutProc === 'TERMINEE'}
                    name="financement"
                    className={styles.formTextarea}
                    onChange={handleChange}
                    value={form.financement}
                    placeholder="Détaillez vos sources de financement..."
                    rows={4}
                  />
                </div>
              </section>

              {/* Expert Minier Section */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiUser className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Expert minier</h3>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nom complet*</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="nom_expert"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.nom_expert}
                      placeholder="Nom et prénom de l'expert"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Fonction*</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="fonction"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.fonction}
                      placeholder="Ex: Géologue senior"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Numéro de registre</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="num_registre"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.num_registre}
                      placeholder="Numéro d'enregistrement"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Organisme*</label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      name="organisme"
                      className={styles.formInput}
                      onChange={handleChange}
                      value={form.organisme}
                      placeholder="Organisme d'affiliation"
                      required
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleBack}
               className={styles.btnPrevious}
                disabled={isLoading}
              >
                <FiChevronLeft className={styles.btnIcon} />
                Précédent
              </button>
              
              <button
                className={styles.btnSave}
                onClick={handleSaveEtape}
                disabled={savingEtape}
              >
                <BsSave className={styles.btnIcon} /> {savingEtape ? "Sauvegarde en cours..." : "Sauvegarder l'étape"}
              </button>
              <button
                onClick={handleNext}
               className={styles.btnNext}
                disabled={isLoading || !form.nom_expert || !form.fonction || !form.organisme}
              >
                Suivant
                                <FiChevronRight className={styles.btnIcon} />

              </button>
            </div>
           <div className={styles.etapeSaveSection}>
              {etapeMessage && (
                <div className={styles.etapeMessage}>
                  {etapeMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
}