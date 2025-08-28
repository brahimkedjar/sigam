'use client';

import { useState, useEffect } from 'react';
import styles from './step11.module.css';
import { useSearchParams } from 'next/navigation';

interface CahierDesCharges {
  id: number;
  id_demande: number;
  num_cdc: string;
  dateExercice: string;
  fuseau?: string;
  typeCoordonnees?: string;
  natureJuridique?: string;
  vocationTerrain?: string;
  nomGerant?: string;
  personneChargeTrxx?: string;
  qualification?: string;
  reservesGeologiques?: number | null;
  reservesExploitables?: number | null;
  volumeExtraction?: string;
  dureeExploitation?: string;
  methodeExploitation?: string;
  dureeTravaux?: string;
  dateDebutTravaux?: string;
  dateDebutProduction?: string;
  investissementDA?: string;
  investissementUSD?: string;
  capaciteInstallee?: string;
  commentaires?: string;
}

const defaultForm: CahierDesCharges = {
  id: 0,
  id_demande: 0,
  num_cdc: '',
  dateExercice: '',
  fuseau: '',
  typeCoordonnees: '',
  natureJuridique: '',
  vocationTerrain: '',
  nomGerant: '',
  personneChargeTrxx: '',
  qualification: '',
  reservesGeologiques: null,
  reservesExploitables: null,
  volumeExtraction: '',
  dureeExploitation: '',
  methodeExploitation: '',
  dureeTravaux: '',
  dateDebutTravaux: '',
  dateDebutProduction: '',
  investissementDA: '',
  investissementUSD: '',
  capaciteInstallee: '',
  commentaires: '',
};

export default function CahierChargesDemande() {
  const [formData, setFormData] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Générales', 'Terrain', 'Réserves', 'Exploitation', 'Investissements', 'Commentaires'];
  const searchParams = useSearchParams();
  const idProc = searchParams?.get('id');
  const [demandeId, setDemandeId] = useState<number | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;     

  useEffect(() => {
    const fetchDemandeFromProc = async (id_proc: string) => {
      try {
        const res = await fetch(`${apiURL}/api/procedures/${id_proc}/demande`);
        const demande = await res.json();
        setDemandeId(demande.id_demande);
      } catch (err) {
        console.error('Erreur récupération demande:', err);
      }
    };

    if (idProc) fetchDemandeFromProc(idProc);
  }, [idProc]);

  useEffect(() => {
    const fetchCahier = async () => {
      try {
        const res = await fetch(`${apiURL}/api/demande/cahier/${demandeId}`);
        if (!res.ok) return;
        const cahier = await res.json();
        setFormData({
          ...cahier,
          dateExercice: cahier.dateExercice ? new Date(cahier.dateExercice).getFullYear().toString() : '',
          reservesGeologiques: cahier.reservesGeologiques ?? null,
          reservesExploitables: cahier.reservesExploitables ?? null,
        });
        setIsEditing(true);
      } catch (err) {
        console.error('Erreur fetch:', err);
      }
    };
    if (demandeId) fetchCahier();
  }, [demandeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'reservesGeologiques' || name === 'reservesExploitables') {
      const floatValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: floatValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(`${apiURL}/api/demande/cahier/${demandeId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  ...formData,
  num_cdc: formData.dateExercice || formData.num_cdc.substring(0, 4),
}),

      });
      if (!res.ok) throw new Error('Erreur sauvegarde');
      const updated = await res.json();
      setFormData(updated);
      setIsEditing(true);
      alert('Enregistré avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur sauvegarde');
    }
  };

  useEffect(() => {
  const fetchCahier = async () => {
    try {
      const res = await fetch(`${apiURL}/api/demande/cahier/${demandeId}`);
      if (!res.ok) return;
      const cahier = await res.json();

      const formatDate = (iso: string | null | undefined) =>
        iso ? new Date(iso).toISOString().split('T')[0] : '';

      setFormData({
        ...cahier,
        dateCreation: formatDate(cahier.dateCreation),
        dateDebutTravaux: formatDate(cahier.dateDebutTravaux),
        dateDebutProduction: formatDate(cahier.dateDebutProduction),
        dateExercice: cahier.dateExercice
          ? new Date(cahier.dateExercice).getFullYear().toString()
          : '',
        reservesGeologiques: cahier.reservesGeologiques ?? null,
        reservesExploitables: cahier.reservesExploitables ?? null,
      });

      setIsEditing(true);
    } catch (err) {
      console.error('Erreur fetch:', err);
    }
  };
  if (demandeId) fetchCahier();
}, [demandeId]);


  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiURL}/api/demande/cahier/${demandeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      setFormData(defaultForm);
      setIsEditing(false);
      alert('Supprimé avec succès');
    } catch (err) {
      console.error(err);
      alert('Erreur suppression');
    }
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const PaginationControl = () => (
    <div className={styles.paginationContainer}>
      <div className={styles.stepDots}>
        {steps.map((step, index) => (
          <button
            key={index}
            className={`${styles.dot} ${currentStep === index ? styles.activeDot : ''}`}
            onClick={() => setCurrentStep(index)}
            aria-label={`Go to step ${index + 1}: ${step}`}
          >
            <span className={styles.dotTooltip}>{step}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.progressTrack}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className={styles.navButtons}>
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className={styles.navButton}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
          <span>Previous</span>
        </button>
        
        <div className={styles.stepIndicator}>
          Step {currentStep + 1} of {steps.length}
        </div>
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className={styles.navButton}
          >
            <span>Next</span>
            <svg className={styles.navIcon} viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className={`${styles.navButton} ${styles.submitButton}`}
          >
            {isEditing ? 'Update' : 'Submit'}
            <svg className={styles.navIcon} viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.stepTitle}>{steps[currentStep]}</span>
          <span className={styles.formTitle}>Cahier des Charges</span>
        </h2>
        <PaginationControl />
      </div>
      <div className={styles.formGrid}>
        {currentStep === 0 && (<div className={styles.formSection}><h3>Informations Générales</h3><div className={styles.formGroup}><label>Date de création</label><input type="date" name="dateCreation" value={formData.num_cdc} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Année d'exercice</label><input type="number" name="dateExercice" value={formData.dateExercice} onChange={handleInputChange} min="1900" max="2100" /></div><div className={styles.formGroup}><label>Fuseau</label><input type="text" name="fuseau" value={formData.fuseau} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Type coordonnées</label><input type="text" name="typeCoordonnees" value={formData.typeCoordonnees} onChange={handleInputChange} /></div></div>)}
        {currentStep === 1 && (<div className={styles.formSection}><h3>Terrain</h3><div className={styles.formGroup}><label>Nature juridique</label><input type="text" name="natureJuridique" value={formData.natureJuridique} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Vocation terrain</label><input type="text" name="vocationTerrain" value={formData.vocationTerrain} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Nom Gérant</label><input type="text" name="nomGerant" value={formData.nomGerant} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Personne en charge des travaux</label><input type="text" name="personneChargeTrxx" value={formData.personneChargeTrxx} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Qualification</label><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} /></div></div>)}
        {currentStep === 2 && (<div className={styles.formSection}><h3>Réserves</h3><div className={styles.formGroup}><label>Réserves Géologiques</label><input type="number" name="reservesGeologiques" value={formData.reservesGeologiques ?? ''} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Réserves Exploitables</label><input type="number" name="reservesExploitables" value={formData.reservesExploitables ?? ''} onChange={handleInputChange} /></div></div>)}
        {currentStep === 3 && (<div className={styles.formSection}><h3>Exploitation</h3><div className={styles.formGroup}><label>Volume Extraction</label><input type="number" name="volumeExtraction" value={formData.volumeExtraction} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Durée Exploitation</label><input type="number" name="dureeExploitation" value={formData.dureeExploitation} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Méthode Exploitation</label><input type="text" name="methodeExploitation" value={formData.methodeExploitation} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Durée Travaux</label><input type="number" name="dureeTravaux" value={formData.dureeTravaux} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Date Début Travaux</label><input type="date" name="dateDebutTravaux" value={formData.dateDebutTravaux} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Date Début Production</label><input type="date" name="dateDebutProduction" value={formData.dateDebutProduction} onChange={handleInputChange} /></div></div>)}
        {currentStep === 4 && (<div className={styles.formSection}><h3>Investissements</h3><div className={styles.formGroup}><label>Investissement DA</label><input type="number" name="investissementDA" value={formData.investissementDA} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Investissement USD</label><input type="number" name="investissementUSD" value={formData.investissementUSD} onChange={handleInputChange} /></div><div className={styles.formGroup}><label>Capacité Installée</label><input type="number" name="capaciteInstallee" value={formData.capaciteInstallee} onChange={handleInputChange} /></div></div>)}
        {currentStep === 5 && (<div className={styles.formSection}><h3>Commentaires</h3><div className={styles.formGroup}><label>Commentaires</label><textarea name="commentaires" value={formData.commentaires} onChange={handleInputChange} rows={3} /></div></div>)}
      </div>

      <div className={styles.actionButtons}>
        {isEditing && (
          <button 
            type="button" 
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            <svg className={styles.deleteIcon} viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}