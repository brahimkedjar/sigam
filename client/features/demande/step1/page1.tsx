'use client';

import styles from './demande.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { cleanLocalStorageForNewDemande } from '../../../utils/cleanLocalStorage';
import Navbar from '../../../features/navbar/Navbar';
import Sidebar from '../../../features/sidebar/Sidebar';
import { FiChevronRight } from 'react-icons/fi';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

type TypePermis = {
  id: number;
  lib_type: string;
  code_type: string;
  regime: string;
  duree_initiale: number;
  nbr_renouv_max: number;
  duree_renouv: number;
  delai_renouv: number;
  superficie_max?: number;
};

export default function DemandeStart() {
  const [selectedPermis, setSelectedPermis] = useState<TypePermis | null>(null);
  const [permisOptions, setPermisOptions] = useState<TypePermis[]>([]);
  const [codeDemande, setCodeDemande] = useState('');
  const [heureDemarrage, setHeureDemarrage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouterWithLoading();
  const { currentView, navigateTo } = useViewNavigator('nouvelle-demande');
  const currentStep = 0;
  const [dateSoumission, setDateSoumission] = useState<Date | null>(new Date());
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const loadPermisTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/type-permis`);
        setPermisOptions(response.data);
      } catch (error) {
        console.error('Failed to load permis types:', error);
      }
    };
    loadPermisTypes();
  }, []);

  const handlePermisChange = async (permisId: number) => {
    try {
      const response = await axios.get(`${apiURL}/type-permis/${permisId}`);
      setSelectedPermis(response.data);
    } catch (error) {
      console.error('Failed to load permis details:', error);
      setSelectedPermis(null);
    }
  };

  /*const handleGenerateCode = async () => {
    if (!selectedPermis) {
      alert("Veuillez sélectionner un type de permis");
      return;
    }

    try {
      cleanLocalStorageForNewDemande();

      const res = await axios.post(
        `${apiURL}/demandes/generate-code`,
        { id_typepermis: selectedPermis.id },
        { withCredentials: true }
      );

      const generatedCode = res.data.code_demande;
      setCodeDemande(generatedCode);
      setHeureDemarrage(new Date().toLocaleString('fr-FR'));

      localStorage.setItem('code_demande', generatedCode);
      localStorage.setItem('selected_permis', JSON.stringify(selectedPermis));
    } catch (err) {
      alert("Erreur lors de la génération du code");
    }
  };*/

  const handleStartProcedure = async () => {
  if (!selectedPermis || !dateSoumission) {
    alert("Veuillez sélectionner un type de permis et une date de soumission.");
    return;
  }

  setLoading(true);
  try {
    cleanLocalStorageForNewDemande();

    const res = await axios.post(`${apiURL}/demandes`, {
  id_typepermis: selectedPermis.id,
  objet_demande: 'Instruction initialisée',
  date_demande: dateSoumission?.toISOString(),         
  date_instruction: new Date().toISOString()            
});


    const code = res.data.code_demande;
    setCodeDemande(code);
    setHeureDemarrage(new Date().toLocaleString('fr-FR'));

    // Save in localStorage
    localStorage.setItem('id_demande', res.data.id_demande);
    localStorage.setItem('id_proc', res.data.procedure.id_proc);
    localStorage.setItem('code_demande', code);
    localStorage.setItem('selected_permis', JSON.stringify(selectedPermis));
    localStorage.setItem('permis_details', JSON.stringify({
      duree_initiale: selectedPermis.duree_initiale,
      nbr_renouv_max: selectedPermis.nbr_renouv_max,
      superficie_max: selectedPermis.superficie_max,
      duree_renouv: selectedPermis.duree_renouv,
    }));
    router.push(`/demande/step2/page2?id=${res.data.procedure.id_proc}`);
  } catch (err) {
    alert("Erreur lors de la création de la demande.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.appContent}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles.mainContent}>
          <div className={styles.breadcrumb}>
            <span>SIGAM</span>
            <FiChevronRight className={styles.breadcrumbArrow} />
            <span>Type Permis</span>
          </div>

          <div className={styles.demandeContainer}>
            {/* Progress Steps */}
            <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />

            {/* Select Permis */}
            <label className={styles.label}>
              Catégorie de permis <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handlePermisChange(Number(e.target.value))}
              value={selectedPermis?.id || ''}
            >
              <option value="">-- Sélectionnez --</option>
              {permisOptions.map((permis) => (
                <option key={permis.id} value={permis.id}>
                  {permis.lib_type} ({permis.code_type}) - {permis.regime}
                </option>
              ))}
            </select>

            {/* Permis Details */}
            {selectedPermis && (
              <div className={styles.permisDetails}>
                <h4>Détails du permis sélectionné:</h4>
                <ul>
                  <li>Durée initiale: {selectedPermis.duree_initiale} ans</li>
                  <li>nombre Renouvellements max: {selectedPermis.nbr_renouv_max}</li>
                  <li>Durée de Renouvellement: {selectedPermis.duree_renouv}</li>
                  <li>Superficie max: {selectedPermis.superficie_max || 'Non spécifié'} ha</li>
                  <li>Délai de renouvellement: {selectedPermis.delai_renouv} jours avant expiration</li>
                </ul>
              </div>
            )}

            {/* System Info */}
            {codeDemande && (
              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>🪪 Informations système</div>
                <p className={styles.infoText}>
                  <strong>Code demande généré :</strong>{' '}
                  <span>{codeDemande}</span>
                </p>
                <p className={styles.infoText}>
                  <strong>Heure de démarrage :</strong> {heureDemarrage}
                </p>
                <p className={styles.infoNote}>
                  📘 Un dossier administratif a été initialisé. Vous pouvez poursuivre l'instruction.
                </p>
              </div>
            )}
            <label className={styles.label}>
  Date de soumission de la demande <span style={{ color: 'red' }}>*</span>
</label>
<div className={styles['datepicker-wrapper']}>
  <DatePicker
    selected={dateSoumission}
    onChange={(date: Date | null) => setDateSoumission(date)}
    dateFormat="dd/MM/yyyy"
    className={styles.select}
    placeholderText="Choisissez une date"
  />
</div>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.button} ${styles.start}`}
                disabled={loading || !selectedPermis}
                onClick={handleStartProcedure}
              >
                {loading ? 'Création...' : 'Démarrer la procédure'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}