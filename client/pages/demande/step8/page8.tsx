import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FiChevronLeft, FiCheck, FiX, FiClock, FiSend, FiFileText, FiChevronRight } from "react-icons/fi";
import styles from './cd_step.module.css';

type MembreComite = {
  id_membre: number;
  nom_membre: string;
  prenom_membre: string;
  fonction_membre: string;
  email_membre: string;
  signature_type: 'electronique' | 'manuelle';
};
import Sidebar from "../../sidebar/Sidebar";
import { useAuthStore } from "../../../src/store/useAuthStore";
import Navbar from "../../navbar/Navbar";
import { BsSave } from "react-icons/bs";
import { useSearchParams } from "next/navigation";
import type { ViewType } from '../../../src/types/viewtype';
import { useViewNavigator } from "../../../src/hooks/useViewNavigator";
import ProgressStepper from "../../../components/ProgressStepper";
import { STEP_LABELS } from "../../../src/constants/steps";

export default function AvisCd() {
  const router = useRouter();
    const searchParams = useSearchParams();
  const idProc = searchParams?.get('id');

  const [membres, setMembres] = useState<MembreComite[]>([]);
  const [idProcedure, setIdProcedure] = useState<number | null>(null);
  const [selectedMembres, setSelectedMembres] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 7;
  const [form, setForm] = useState({
    date_comite: new Date().toISOString(),
    numero_decision: "",
    objet_deliberation: "",
    decision_comite: "favorable",
    resume_reunion: "",
    motif: "",
    fiche_technique: "",
    carte_projettee: "",
    rapport_police: "",
    instructeur: "",
  });

  useEffect(() => {
      const activateStep = async () => {
        if (!idProc) return;
        try {
          await axios.post(`http://localhost:3001/api/procedure-etape/start/${idProc}/8`);
        } catch (err) {
          console.error("Échec de l'activation de l'étape");
        }
      };
    
      activateStep();
    }, [idProc]);
 

  useEffect(() => {
    if (!idProc) return;

    axios.get(`http://localhost:3001/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande.toString());
        setCodeDemande(res.data.code_demande);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

  const rejectDemande = async () => {
    if (!rejectionReason) {
      setError("Veuillez spécifier un motif de rejet");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/demande/${idDemande}/status`,
        { 
          statut_demande: 'rejete',
          motif_rejet: rejectionReason
        }
      );
      setSuccess("Demande rejetée avec succès");
    } catch (err) {
      console.error("Erreur lors du rejet", err);
      setError("Erreur lors du rejet");
    }
  };

 const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`http://localhost:3001/api/procedure-etape/finish/${idProc}/8`);
    setEtapeMessage("Étape 8 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

  const fetchMembres = async () => {
    try {
      const res = await axios.get("http://localhost:3001/cd");
      setMembres(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Erreur lors du chargement des membres");
    }
  };

  const fetchDecision = async (procId: number) => {
  try {
    const res = await axios.get(`http://localhost:3001/cd/${procId}`);
    const data = res.data;

    if (data) {
      setForm({
        date_comite: data.date_comite,
        numero_decision: data.numero_decision,
        objet_deliberation: data.objet_deliberation,
        decision_comite: data.decision_comite,
        resume_reunion: data.resume_reunion || '',
        motif: data.motif || '',
        fiche_technique: data.fiche_technique || '',
        carte_projettee: data.carte_projettee || '',
        rapport_police: data.rapport_police || '',
        instructeur: data.instructeur || ''
      });

      if (data.membres && Array.isArray(data.membres)) {
        const membreIds = data.membres.map((m: any) => m.id_membre);
        setSelectedMembres(membreIds);
      }
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du comité :", err);
    setError("Erreur lors du chargement de la décision existante");
  }
};

const handleBack = () => {
    if (!idProc) {
      setError("ID procédure manquant");
      return;
    }
    router.push(`/demande/step7/page7?id=${idProc}`);
  };
  const submit = async () => {
    setError(null);
    
    // Validation
    if (!form.numero_decision) {
      setError("Le numéro de décision est obligatoire");
      return;
    }
    if (!form.objet_deliberation) {
      setError("L'objet de la délibération est obligatoire");
      return;
    }
    
    if (!idProcedure) {
      setError("Impossible de déterminer la procédure associée");
      return;
    }
    if (form.decision_comite === 'defavorable' && !form.motif) {
      setError("Un motif est obligatoire pour une décision défavorable");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:3001/cd", {
        ...form,
        id_procedure: idProcedure,
        membre_ids: selectedMembres,
      });
      setSuccess("Décision enregistrée avec succès !");
      setTimeout(() => {
        router.push(`/demande/step9/page9?id=${idProc}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setError("Erreur lors de l'enregistrement de la décision");
    } finally {
      setIsSubmitting(false);
    }
  };

 useEffect(() => {
  if (idProc) {
    const numericId =
      typeof idProc === "string" ? parseInt(idProc) :
      Array.isArray(idProc) ? parseInt(idProc[0]) :
      NaN;

    if (!isNaN(numericId)) {
      setIdProcedure(numericId);
      fetchMembres();
      fetchDecision(numericId);
    } else {
      setError("Identifiant de procédure invalide.");
    }
  }
}, [idProc]);


 return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Avis-CD</span>
          </div>
          <div className={styles['container']}>
                        <div className={styles['content-wrapper']}>

            {/* Progress Steps */}
          <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />


              <h1 className={styles['header']}>
                <span className={styles['step-number']}>Étape 8</span>
                Comité de direction
              </h1>
              <div className={styles['demande-actions']}>
                    <div className={styles['reject-section']}>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Motif de rejet"
                        className={styles['reject-input']}
                      />
                      <button
                        className={styles['reject-btn']}
                        onClick={rejectDemande}
                      >
                        Rejeter la demande
                      </button>
                    </div>
                    
                  </div>
              <div className={styles['section']}>
                <h2 className={styles['section-title']}>Préparation du dossier</h2>
                
                <div className={styles['input-group']}>
                  <label className={styles['label']}>Ingénieur instructeur assigné *</label>
                  <input 
                    className={styles['input']} 
                    placeholder="Nom complet de l'instructeur"
                    value={form.instructeur}
                    onChange={(e) => setForm({ ...form, instructeur: e.target.value })} 
                  />
                </div>

                <div className={styles['input-group']}>
                  <label className={styles['label']}>Documents joints</label>
                  <input 
                    className={styles['input']} 
                    placeholder="Lien fiche technique"
                    value={form.fiche_technique}
                    onChange={(e) => setForm({ ...form, fiche_technique: e.target.value })} 
                  />
                  <input 
                    className={`${styles['input']} ${styles['mt-2']}`} 
                    placeholder="Carte projetée (URL)"
                    value={form.carte_projettee}
                    onChange={(e) => setForm({ ...form, carte_projettee: e.target.value })} 
                  />
                  <input 
                    className={`${styles['input']} ${styles['mt-2']}`} 
                    placeholder="Rapport police (URL)"
                    value={form.rapport_police}
                    onChange={(e) => setForm({ ...form, rapport_police: e.target.value })} 
                  />
                </div>
              </div>

              <div className={styles['section']}>
                <h2 className={styles['section-title']}>Membres du Comité de Direction</h2>
                <p className={styles['section-subtitle']}>Sélectionnez les membres présents *</p>
                
                <div className={styles['members-list']}>
                  {membres.map((m) => (
                    <div key={m.id_membre} className={styles['member-item']}>
                      <input
                        type="checkbox"
                        className={styles['member-checkbox']}
                        checked={selectedMembres.includes(m.id_membre)}
                        onChange={(e) =>
                          setSelectedMembres(e.target.checked
                            ? [...selectedMembres, m.id_membre]
                            : selectedMembres.filter((id) => id !== m.id_membre)
                          )
                        }
                      />
                      <div className={styles['member-info']}>
                        <div className={styles['member-name']}>{m.prenom_membre} {m.nom_membre}</div>
                        <div className={styles['member-role']}>{m.fonction_membre}</div>
                        <div className={styles['member-email']}>{m.email_membre}</div>
                        <div className={`${styles['signature-type']} ${styles[m.signature_type]}`}>
                          {m.signature_type === 'electronique' ? 'Signature électronique' : 'Signature manuelle'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={styles['presence-count']}>
                  Membres présents: {selectedMembres.length} / {membres.length}
                  {selectedMembres.length === 0 && (
  <span className={styles['warning']}> (Aucun membre sélectionné)</span>
)}

                </div>
              </div>

              <div className={styles['section']}>
                <h2 className={styles['section-title']}>Décision du Comité</h2>
                
                <div className={styles['input-group']}>
                  <label className={styles['label']}>Date de réunion *</label>
                  <input 
                    type="date"
                    className={styles['input']}
                    value={form.date_comite.slice(0, 10)}
                    onChange={(e) => setForm({ ...form, date_comite: new Date(e.target.value).toISOString() })} 
                  />
                </div>
                
                <div className={styles['input-group']}>
                  <label className={styles['label']}>Numéro de décision *</label>
                  <input 
                    className={styles['input']} 
                    placeholder="Ex: CD-2025-014"
                    value={form.numero_decision}
                    onChange={(e) => setForm({ ...form, numero_decision: e.target.value })} 
                  />
                </div>
                
                <div className={styles['input-group']}>
                  <label className={styles['label']}>Objet de la délibération *</label>
                  <input 
                    className={styles['input']} 
                    placeholder="Ex: Attribution de permis d'exploitation de granit"
                    value={form.objet_deliberation}
                    onChange={(e) => setForm({ ...form, objet_deliberation: e.target.value })} 
                  />
                </div>
                
                <div className={styles['input-group']}>
                  <label className={styles['label']}>Résumé de la réunion</label>
                  <textarea 
                    className={styles['textarea']} 
                    placeholder="Détails de la discussion et points abordés"
                    value={form.resume_reunion}
                    onChange={(e) => setForm({ ...form, resume_reunion: e.target.value })} 
                  />
                </div>
                
                <div className={styles['decision-buttons']}>
                  <button 
                    className={`${styles['decision-button']} ${styles['favorable']} ${form.decision_comite === 'favorable' ? styles['active'] : ''}`}
                    onClick={() => setForm({ ...form, decision_comite: 'favorable', motif: '' })}
                  >
                    <FiCheck className={styles['btn-icon']} />
                    Acceptée
                  </button>
                  <button 
                    className={`${styles['decision-button']} ${styles['defavorable']} ${form.decision_comite === 'defavorable' ? styles['active'] : ''}`}
                    onClick={() => setForm({ ...form, decision_comite: 'defavorable' })}
                  >
                    <FiX className={styles['btn-icon']} />
                    Refusée
                  </button>
                </div>

                {form.decision_comite === 'defavorable' && (
                  <div className={styles['input-group']}>
                    <label className={styles['label']}>Motif du refus *</label>
                    <textarea 
                      className={styles['textarea']} 
                      placeholder="Raison du refus (obligatoire)"
                      value={form.motif}
                      onChange={(e) => setForm({ ...form, motif: e.target.value })} 
                    />
                  </div>
                )}
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
                  onClick={submit} 
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}