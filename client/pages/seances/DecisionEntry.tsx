// components/decisions/DecisionEntry.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './DecisionEntry.module.css';

interface Procedure {
  id_proc: number;
  num_proc: string;
  typeProcedure: {
    libelle: string;  // Changed from nom_type to libelle
  };
  demandes: {
    detenteur: {
      nom_sociétéFR: string;
    };
  }[];
}

interface ComiteDirection {
  id_comite: number;
  date_comite: string;
  numero_decision: string;
  objet_deliberation: string;
  resume_reunion: string;
  fiche_technique: string | null;
  carte_projettee: string | null;
  rapport_police: string | null;
  instructeur: string | null;
  decisionCDs: Decision[];
}

interface Decision {
  id_decision: number;
  decision_cd: 'favorable' | 'defavorable' | null;
  duree_decision: number | null;
  commentaires: string | null;
  id_comite: number;
}

interface ComiteDirection {
  id_comite: number;
  decisionCDs: Decision[];
}

interface SeanceWithDecisions {
  id_seance: number;
  num_seance: string;
  date_seance: string;
  comites: ComiteDirection[];
  procedures: Procedure[];
}

export default function DecisionEntry() {
  const [seances, setSeances] = useState<SeanceWithDecisions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeance, setSelectedSeance] = useState<SeanceWithDecisions | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [currentProcedure, setCurrentProcedure] = useState<Procedure | null>(null);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [currentComite, setCurrentComite] = useState<ComiteDirection | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
const [comiteFormData, setComiteFormData] = useState({
    date_comite: '',
    numero_decision: '',
    objet_deliberation: '',
    resume_reunion: '',
    fiche_technique: '',
    carte_projettee: '',
    rapport_police: '',
    instructeur: ''
  });
  const [formData, setFormData] = useState({
    id_comite: 0,
    decision_cd: '',
    duree_decision: '',
    commentaires: ''
  });

  useEffect(() => {
    const fetchSeances = async () => {
      try {
        const response = await fetch(`${apiURL}/api/seances/with-decisions`);
        const data = await response.json();
        console.log('sssssssssssssssssss',data)
        setSeances(data);
      } catch (error) {
        console.error('Error fetching seances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeances();
  }, []);

  const openDecisionModal = (seance: SeanceWithDecisions, procedure: Procedure, procedureIndex: number) => {
  setSelectedSeance(seance);
  const comite = seance.comites[0];
  
  // Get decision by index position since they should correspond to procedures
  const decision = comite?.decisionCDs[procedureIndex] || null;
  
  setCurrentProcedure(procedure);
  setCurrentComite(comite);
  setCurrentDecision(decision);
  
  // Initialize comite form data if comite exists
  if (comite) {
    setComiteFormData({
      date_comite: comite.date_comite ? format(new Date(comite.date_comite), "yyyy-MM-dd'T'HH:mm") : '',
      numero_decision: comite.numero_decision || '',
      objet_deliberation: comite.objet_deliberation || '',
      resume_reunion: comite.resume_reunion || '',
      fiche_technique: comite.fiche_technique || '',
      carte_projettee: comite.carte_projettee || '',
      rapport_police: comite.rapport_police || '',
      instructeur: comite.instructeur || ''
    });
  } else {
    // Default values for new comite
    setComiteFormData({
      date_comite: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      numero_decision: `DEC-${format(new Date(), 'yyyyMMdd-HHmm')}`,
      objet_deliberation: `Décisions relatives à la séance ${seance.num_seance}`,
      resume_reunion: '',
      fiche_technique: '',
      carte_projettee: '',
      rapport_police: '',
      instructeur: ''
    });
  }

  setFormData({
    id_comite: comite?.id_comite || 0,
    decision_cd: decision?.decision_cd || '',
    duree_decision: decision?.duree_decision?.toString() || '',
    commentaires: decision?.commentaires || ''
  });
  setDecisionModalOpen(true);
};

  const handleSubmitDecision = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (!selectedSeance) {
      throw new Error('No selected seance');
    }

    let comiteId = currentComite?.id_comite;

    // First create/update the comite if needed
    if (!currentComite) {
      console.log('Creating new comite with data:', {
        id_seance: selectedSeance.id_seance,
        ...comiteFormData,
        date_comite: new Date(comiteFormData.date_comite)
      });

      const comiteResponse = await fetch(`${apiURL}/api/comites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_seance: selectedSeance.id_seance,
          ...comiteFormData,
          date_comite: new Date(comiteFormData.date_comite)
        }),
      });

      if (!comiteResponse.ok) {
        const errorData = await comiteResponse.json();
        console.error('Comite creation failed:', errorData);
        throw new Error('Failed to create comite');
      }

      const newComite = await comiteResponse.json();
      console.log('Created new comite:', newComite);
      comiteId = newComite.id_comite;
    } else {
      console.log('Updating existing comite:', currentComite.id_comite);
      const updateResponse = await fetch(`${apiURL}/api/comites/${currentComite.id_comite}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...comiteFormData,
          date_comite: new Date(comiteFormData.date_comite)
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Comite update failed:', errorData);
        throw new Error('Failed to update comite');
      }
    }

    // Then handle the decision
    if (comiteId) {
      const decisionData = {
        id_comite: comiteId,
        decision_cd: formData.decision_cd as 'favorable' | 'defavorable',
        duree_decision: parseInt(formData.duree_decision) || null,
        commentaires: formData.commentaires || null
      };

      console.log('Saving decision with data:', decisionData);

      const url = currentDecision 
        ? `${apiURL}/api/decisions/${currentDecision.id_decision}`
        : `${apiURL}/api/decisions`;
      const method = currentDecision ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decisionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Decision save failed:', errorData);
        throw new Error('Failed to save decision');
      }

      const result = await response.json();
      console.log('Decision saved successfully:', result);
    }

    // Refresh data
    const updatedResponse = await fetch(`${apiURL}/api/seances/with-decisions`);
    const updatedData = await updatedResponse.json();
    setSeances(updatedData);
    setDecisionModalOpen(false);
  } catch (error) {
    console.error('Error in handleSubmitDecision:', error);
    alert(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
  }
};


  const handleComiteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComiteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des séances...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Saisie des Décisions du Comité</h1>
        <p className={styles.subtitle}>Enregistrer les décisions prises lors des séances du comité</p>
        <Link href="/seances/Dashboard_seances" className={styles.backButton}>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
       viewBox="0 0 24 24" fill="none" stroke="currentColor" 
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
  Retour au menu
</Link>
      </header>

      <div className={styles.seanceList}>
        {seances.map(seance => (
          <div key={seance.id_seance} className={styles.seanceCard}>
            <div className={styles.seanceHeader}>
              <h2 className={styles.seanceTitle}>Séance {seance.num_seance}</h2>
              <div className={styles.seanceDate}>
                {format(new Date(seance.date_seance), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
              <div className={styles.seanceStats}>
                {seance.comites[0]?.decisionCDs.filter(d => d.decision_cd).length} / {seance.procedures.length} décisions
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.decisionTable}>
                <thead>
                  <tr>
                    <th>Procédure</th>
                    <th>Société</th>
                    <th>Type</th>
                    <th>Décision</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
  {seance.procedures.map((procedure, index) => {
    const decision = seance.comites[0]?.decisionCDs[index];
    
    return (
      <tr key={procedure.id_proc}>
        <td>{procedure.num_proc}</td>
        <td>
          {procedure.demandes && procedure.demandes.length > 0 && procedure.demandes[0].detenteur 
            ? procedure.demandes[0].detenteur.nom_sociétéFR 
            : 'N/A'}
        </td>
        <td>
          {procedure.typeProcedure 
            ? procedure.typeProcedure.libelle
            : 'N/A'}
        </td>
        <td>
          {decision?.decision_cd ? (
            <span className={`${styles.decisionBadge} ${
              decision.decision_cd === 'favorable' ? styles.approved : styles.rejected
            }`}>
              {decision.decision_cd === 'favorable' ? 'Approuvée' : 'Rejetée'}
            </span>
          ) : (
            <span className={styles.pendingBadge}>En attente</span>
          )}
        </td>
        <td>
          <button 
            onClick={() => openDecisionModal(seance, procedure, index)}
            className={decision ? styles.editButton : styles.primaryButton}
          >
            {decision ? 'Modifier' : 'Saisir'}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Decision Modal */}
      {decisionModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                {currentDecision ? 'Modifier la décision' : 'Saisir une décision'}
                <br />
                <small>{currentProcedure?.num_proc}</small>
              </h2>
              <button 
                onClick={() => setDecisionModalOpen(false)}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitDecision} className={styles.modalForm}>
                {/* Add this section to your modal form */}
<div className={styles.sectionTitle}>Informations du Comité</div>

<div className={styles.formGroup}>
  <label htmlFor="date_comite">Date du comité *</label>
  <input
    type="datetime-local"
    id="date_comite"
    name="date_comite"
    value={comiteFormData.date_comite}
    onChange={handleComiteFormChange}
    required
  />
</div>

<div className={styles.formGroup}>
  <label htmlFor="numero_decision">Numéro de décision *</label>
  <input
    type="text"
    id="numero_decision"
    name="numero_decision"
    value={comiteFormData.numero_decision}
    onChange={handleComiteFormChange}
    required
  />
</div>

<div className={styles.formGroup}>
  <label htmlFor="objet_deliberation">Objet de délibération *</label>
  <input
    type="text"
    id="objet_deliberation"
    name="objet_deliberation"
    value={comiteFormData.objet_deliberation}
    onChange={handleComiteFormChange}
    required
  />
</div>

<div className={styles.formGroup}>
  <label htmlFor="resume_reunion">Résumé de la réunion</label>
  <textarea
    id="resume_reunion"
    name="resume_reunion"
    rows={3}
    value={comiteFormData.resume_reunion}
    onChange={handleComiteFormChange}
  />
</div>

<div className={styles.formGroup}>
  <label htmlFor="instructeur">Instructeur</label>
  <input
    type="text"
    id="instructeur"
    name="instructeur"
    value={comiteFormData.instructeur}
    onChange={handleComiteFormChange}
  />
</div>
              <div className={styles.formGroup}>
  <label>Société</label>
  <div className={styles.staticField}>
    {currentProcedure?.demandes && currentProcedure.demandes.length > 0 && currentProcedure.demandes[0].detenteur
      ? currentProcedure.demandes[0].detenteur.nom_sociétéFR
      : 'N/A'}
  </div>
</div>

<div className={styles.formGroup}>
  <label>Type de procédure</label>
  <div className={styles.staticField}>
    {currentProcedure?.typeProcedure
      ? currentProcedure.typeProcedure.libelle  // Changed from nom_type to libelle
      : 'N/A'}
  </div>
</div>

              <div className={styles.formGroup}>
                <label htmlFor="decision_cd">Décision *</label>
                <select
                  id="decision_cd"
                  value={formData.decision_cd}
                  onChange={(e) => setFormData({...formData, decision_cd: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="favorable">Favorable</option>
                  <option value="defavorable">Défavorable</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duree_decision">Durée (années)</label>
                <input
                  type="number"
                  id="duree_decision"
                  min="1"
                  value={formData.duree_decision}
                  onChange={(e) => setFormData({...formData, duree_decision: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="commentaires">Commentaires</label>
                <textarea
                  id="commentaires"
                  rows={3}
                  value={formData.commentaires}
                  onChange={(e) => setFormData({...formData, commentaires: e.target.value})}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className={styles.secondaryButton}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                >
                  {currentDecision ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}