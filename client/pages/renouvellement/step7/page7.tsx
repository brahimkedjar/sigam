// app/demande/step8/page8.tsx
'use client';

import { useEffect, useState } from "react";
import { useRouterWithLoading } from "@/src/hooks/useRouterWithLoading";

import axios, { isAxiosError } from "axios";
import { 
  FiChevronLeft, 
  FiCheck, 
  FiX, 
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiMap,
  FiAlertCircle,
  FiEdit2,
  FiDownload
} from "react-icons/fi";
import styles from '@/pages/demande/step8/cd_step.module.css';
import Sidebar from "../../sidebar/Sidebar";
import Navbar from "../../navbar/Navbar";
import { useSearchParams } from "next/navigation";
import ProgressStepper from "../../../components/ProgressStepper";
import { STEP_LABELS } from "../../../src/constants/steps";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useViewNavigator } from "@/src/hooks/useViewNavigator";
import { useActivateEtape } from "@/src/hooks/useActivateEtape";

type MembreComite = {
  id_membre: number;
  nom_membre: string;
  prenom_membre: string;
  fonction_membre: string;
  email_membre: string;
  signature_type: 'electronique' | 'manuelle';
};

type SeanceCD = {
  id_seance: number;
  num_seance: string;
  date_seance: string;
  exercice: number;
  remarques?: string;
  membres: MembreComite[];
};

type ComiteDirection = {
  id_comite: number;
  date_comite: string;
  numero_decision: string;
  objet_deliberation: string;
  resume_reunion: string;
  fiche_technique?: string;
  carte_projettee?: string;
  rapport_police?: string;
  decisions: DecisionCD[];
};

type DecisionCD = {
  id_decision?: number;
  decision_cd: 'favorable' | 'defavorable';
  duree_decision?: number;
  commentaires?: string;
};

interface ComiteFormData {
  date_comite: string;
  numero_decision: string;
  objet_deliberation: string;
  resume_reunion: string;
  fiche_technique: string;
  carte_projettee: string;
  rapport_police: string;
  decisions?: DecisionCD[];
}

const SeanceList = ({ seances, selectedSeance, onSelect }: {
  seances: SeanceCD[],
  selectedSeance: number | null,
  onSelect: (id: number) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter seances based on search term
  const filteredSeances = seances.filter(seance =>
    seance.num_seance.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seance.date_seance.includes(searchTerm) ||
    seance.membres.some(m => 
      `${m.prenom_membre} ${m.nom_membre}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSeances.length / itemsPerPage);
  const paginatedSeances = filteredSeances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.seanceListContainer}>
      <div className={styles.listControls}>
        <input
          type="text"
          placeholder="Rechercher une séance..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className={styles.searchInput}
        />
        
        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>

      <div className={styles.seanceList}>
        {paginatedSeances.length > 0 ? (
          paginatedSeances.map(seance => (
            <div
              key={seance.id_seance}
              className={`${styles.seanceItem} ${selectedSeance === seance.id_seance ? styles.selected : ''}`}
              onClick={() => onSelect(seance.id_seance)}
            >
              <div className={styles.seanceInfo}>
                <h3>{seance.num_seance}</h3>
                <p>{new Date(seance.date_seance).toLocaleDateString()}</p>
                <p>Exercice: {seance.exercice}</p>
                <p>{seance.membres.length} membres</p>
              </div>
              {seance.remarques && (
                <div className={styles.seanceRemarks}>
                  <p>{seance.remarques}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className={styles.noResults}>
            {searchTerm ? "Aucune séance trouvée" : "Aucune séance disponible"}
          </p>
        )}
      </div>
    </div>
  );
};

export default function ComiteDirectionPage() {
  const router = useRouterWithLoading();
  const searchParams = useSearchParams();
  const originalIdStr = searchParams?.get("originalDemandeId");
  const originalProcIdStr = searchParams?.get("original_proc_id");
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const originalId = originalIdStr ? parseInt(originalIdStr, 10) : undefined;
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 6;
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // State management
  const [membres, setMembres] = useState<MembreComite[]>([]);
  const [seances, setSeances] = useState<SeanceCD[]>([]);
  const [comites, setComites] = useState<ComiteDirection[]>([]);
  const [selectedSeance, setSelectedSeance] = useState<number | null>(null);
  const [selectedComite, setSelectedComite] = useState<number | null>(null);
  const [selectedMembres, setSelectedMembres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'seances' | 'comites'>('seances');
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
  const [rejectionReason, setRejectionReason] = useState("");
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  useActivateEtape({ idProc, etapeNum: 7, statutProc });
  // Form states
  const [seanceForm, setSeanceForm] = useState({
    exercice: new Date().getFullYear(),
    remarques: ''
  });

const [comiteForm, setComiteForm] = useState<ComiteFormData>({
  date_comite: new Date().toISOString().split('T')[0],
  numero_decision: '',
  objet_deliberation: '',
  resume_reunion: '',
  fiche_technique: '',
  carte_projettee: '',
  rapport_police: '',
  decisions: []
});

// Handle saving etape
const handleSaveEtape = async () => {
  if (!idProc) {
    toast.error("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/7`);
    toast.success("Étape 7 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

// Initialize data
useEffect(() => {
  if (!idProc) return;

  const fetchInitialData = async () => {
  if (!idProc) return;

  try {
    setIsLoading(true);
    
    // Fetch all required data
    const [membresRes, seancesRes, procedureRes] = await Promise.all([
      axios.get(`${apiURL}/cd/membres`),
      axios.get(`${apiURL}/cd/seances`),
      axios.get(`${apiURL}/api/procedures/${idProc}`)
    ]);

    // Set basic data
    setMembres(membresRes.data);
    setSeances(seancesRes.data);
    setStatutProc(procedureRes.data?.statut_proc || null);

    // Safely get demande ID
    const firstDemandeId = procedureRes.data?.demandes?.[0]?.id_demande;
    setIdDemande(firstDemandeId ? firstDemandeId.toString() : null);

    // Try to fetch comités if they exist
    try {
     const comitesRes = await axios.get(`${apiURL}/cd/comites/procedure/${idProc}`);
const transformedData = comitesRes.data.map((comite: { decisionCDs: any; }) => ({
  ...comite,
  decisions: comite.decisionCDs // Map decisionCDs to decisions
}));
      setComites(transformedData)
      
      if (comitesRes.data?.length > 0) {
        setSelectedComite(comitesRes.data[0].id_comite);
      }
    } catch (comiteError) {
      if (axios.isAxiosError(comiteError) && comiteError.response?.status === 404) {
        setComites([]); // No comités exist yet
      } else {
        console.error("Error fetching comités:", comiteError);
        toast.error("Erreur lors du chargement des comités");
      }
    }

    // Select first seance if available
    if (seancesRes.data?.length > 0) {
      setSelectedSeance(seancesRes.data[0].id_seance);
    }

  } catch (err) {
    console.error("Error fetching initial data:", err);
    toast.error("Erreur lors du chargement des données");
  } finally {
    setIsLoading(false);
  }
};

  fetchInitialData();
}, [idProc]);

// Handle seance creation
const handleCreateSeance = async () => {
  if (selectedMembres.length === 0) {
    toast.error("Veuillez sélectionner au moins un membre");
    return;
  }

  try {
    setIsLoading(true);
    const response = await axios.post(`${apiURL}/cd/seances`, {
      ...seanceForm,
      membre_ids: selectedMembres
    });

    setSeances([...seances, response.data]);
    setSelectedSeance(response.data.id_seance);
    toast.success("Séance créée avec succès");
    setMode('view');
  } catch (err) {
    console.error("Error creating seance:", err);
    toast.error("Erreur lors de la création de la séance");
  } finally {
    setIsLoading(false);
  }
};

// Handle comite creation/update
const handleSaveComite = async () => {
  if (!selectedSeance || !idProc) {
    toast.error("Veuillez sélectionner une séance");
    return;
  }

  // Validate required fields
  if (!comiteForm.numero_decision || !comiteForm.objet_deliberation) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  try {
    setIsSubmitting(true);
    
    if (selectedComite) {
      // Update existing comite - using PUT with full comité ID
      await axios.put(`${apiURL}/cd/comites/${selectedComite}`, {
        ...comiteForm,
        id_seance: selectedSeance,
        id_procedure: idProc
      });
      toast.success("Comité mis à jour avec succès");
    } else {
      // Create new comite - using POST to /cd/comites
      await axios.post(`${apiURL}/cd/comites`, {
        ...comiteForm,
        id_seance: selectedSeance,
        id_procedure: idProc
      });
      toast.success("Comité créé avec succès");
    }

    // Refresh comites list using the procedure endpoint
    const comitesRes = await axios.get(`${apiURL}/cd/comites/procedure/${idProc}`);
    setComites(comitesRes.data);
    setMode('view');
  } catch (err) {
    console.error("Error saving comite:", err);
    toast.error("Erreur lors de l'enregistrement du comité");
  } finally {
    setIsSubmitting(false);
  }
};

// Handle demande rejection
const rejectDemande = async () => {
  if (!rejectionReason || !idDemande) {
    toast.error("Veuillez spécifier un motif de rejet");
    return;
  }

  try {
    await axios.put(`${apiURL}/api/demandes/${idDemande}/status`, {
      statut_demande: 'rejete',
      motif_rejet: rejectionReason
    });
    toast.success("Demande rejetée avec succès");
  } catch (err) {
    console.error("Error rejecting demande:", err);
    toast.error("Erreur lors du rejet de la demande");
  }
};

// Handle decision changes
const updateDecision = (index: number, field: keyof DecisionCD, value: any) => {
  const newDecisions = [...comiteForm.decisions!];
  newDecisions[index] = { ...newDecisions[index], [field]: value };
  setComiteForm({ ...comiteForm, decisions: newDecisions });
};

const addDecision = () => {
  setComiteForm({
    ...comiteForm,
    decisions: [
      ...comiteForm.decisions!,
      { decision_cd: 'favorable', duree_decision: undefined, commentaires: '' }
    ]
  });
};

const removeDecision = (index: number) => {
  if (comiteForm.decisions!.length <= 1) return;
  const newDecisions = [...comiteForm.decisions!];
  newDecisions.splice(index, 1);
  setComiteForm({ ...comiteForm, decisions: newDecisions });
};

// Get current seance and comite
const currentSeance = seances.find(s => s.id_seance === selectedSeance);
const currentComite = comites.find(c => c.id_comite === selectedComite);

// Handle tab changes
const handleTabChange = (tab: 'seances' | 'comites') => {
  setActiveTab(tab);
  setMode('view');
};

// Handle edit mode
const handleEditComite = () => {
  if (!currentComite) return;
  setComiteForm({
    date_comite: currentComite.date_comite.split('T')[0],
    numero_decision: currentComite.numero_decision,
    objet_deliberation: currentComite.objet_deliberation,
    resume_reunion: currentComite.resume_reunion,
    fiche_technique: currentComite.fiche_technique || '',
    carte_projettee: currentComite.carte_projettee || '',
    rapport_police: currentComite.rapport_police || '',
    decisions: currentComite.decisions.map(d => ({
      decision_cd: d.decision_cd,
      duree_decision: d.duree_decision,
      commentaires: d.commentaires || ''
    }))
  });
  setMode('edit');
};

// Handle create new comite
const handleCreateComite = () => {
  setComiteForm({
    date_comite: new Date().toISOString().split('T')[0],
    numero_decision: '',
    objet_deliberation: '',
    resume_reunion: '',
    fiche_technique: '',
    carte_projettee: '',
    rapport_police: '',
    decisions: [{
      decision_cd: 'favorable',
      duree_decision: undefined,
      commentaires: ''
    }]
  });
  setMode('create');
};

// Generate PDF report
const generateReport = async () => {
  if (!selectedComite) return;
  
  try {
    const response = await axios.get(`${apiURL}/cd/comites/${selectedComite}/report`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `comite-${currentComite?.numero_decision}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Error generating report:", err);
    toast.error("Erreur lors de la génération du rapport");
  }
};

const handleNext = () => {
    router.push(`/renouvellement/step8/page8?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalIdStr}`);
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
            <span>Comité de Direction</span>
          </div>

          <div className={styles.container}>
            <div className={styles.contentWrapper}>
              <ProgressStepper
  steps={
    originalProcIdStr
      ? STEP_LABELS.filter((step) => step !== "Avis Wali")
      : STEP_LABELS
  }
  currentStep={currentStep}
/>

              <h1 className={styles.header}>
                <span className={styles.stepNumber}>8</span>
                Comité de Direction
              </h1>

              {/* Reject Section */}
              {statutProc !== 'TERMINEE' && (
                <div className={styles.card}>
                  <div className={styles.rejectSection}>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Motif de rejet"
                      className={styles.rejectInput}
                      disabled={statutProc === 'TERMINEE'}
                    />
                    <button
                      className={styles.rejectBtn}
                      onClick={rejectDemande}
                      disabled={statutProc === 'TERMINEE' || !statutProc || !idDemande}
                    >
                      <FiAlertCircle /> Rejeter la demande
                    </button>
                  </div>
                </div>
              )}

              {/* Main Tabs */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tabButton} ${activeTab === 'seances' ? styles.active : ''}`}
                  onClick={() => handleTabChange('seances')}
                >
                  <FiCalendar /> Séances ({seances.length})
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'comites' ? styles.active : ''}`}
                  onClick={() => handleTabChange('comites')}
                  disabled={seances.length === 0}
                >
                  <FiFileText /> Comités ({comites.length})
                </button>
              </div>

              {/* Seances Tab */}
              {activeTab === 'seances' && (
                <div className={styles.tabContent}>
                  {mode === 'view' ? (
                    <>
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h2 className={styles.cardTitle}>
                            <FiCalendar /> Séances programmées
                          </h2>
                          <button
                            className={styles.addButton}
                            onClick={() => setMode('create')}
                            
                          >
                            <FiPlus /> Nouvelle séance
                          </button>
                        </div>

                        <SeanceList 
  seances={seances}
  selectedSeance={selectedSeance}
  onSelect={setSelectedSeance}
/>
                      </div>

                      {currentSeance && (
                        <div className={styles.card}>
                          <h2 className={styles.cardTitle}>
                            Détails de la séance {currentSeance.num_seance}
                          </h2>
                          
                          <div className={styles.seanceDetails}>
                            <div className={styles.detailItem}>
                              <strong>Date:</strong> {new Date(currentSeance.date_seance).toLocaleDateString()}
                            </div>
                            <div className={styles.detailItem}>
                              <strong>Exercice:</strong> {currentSeance.exercice}
                            </div>
                            {currentSeance.remarques && (
                              <div className={styles.detailItem}>
                                <strong>Remarques:</strong> {currentSeance.remarques}
                              </div>
                            )}
                          </div>

                          <h3 className={styles.subTitle}>Membres participants</h3>
                          <div className={styles.membersGrid}>
                            {currentSeance.membres.map(membre => (
                              <div key={membre.id_membre} className={styles.memberCard}>
                                <div className={styles.memberName}>
                                  {membre.prenom_membre} {membre.nom_membre}
                                </div>
                                <div className={styles.memberFunction}>
                                  {membre.fonction_membre}
                                </div>
                                <div className={styles.memberEmail}>
                                  {membre.email_membre}
                                </div>
                                <div className={`${styles.signatureBadge} ${membre.signature_type === 'electronique' ? styles.electronic : styles.manual}`}>
                                  {membre.signature_type === 'electronique' ? 'Signature électronique' : 'Signature manuelle'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.card}>
                      <h2 className={styles.cardTitle}>
                        <FiPlus /> Créer une nouvelle séance
                      </h2>

                      <div className={styles.formGroup}>
                        <label>Exercice *</label>
                        <input
                          type="number"
                          value={seanceForm.exercice}
                          onChange={(e) => setSeanceForm({
                            ...seanceForm,
                            exercice: parseInt(e.target.value) || new Date().getFullYear()
                          })}
                          min="2000"
                          max="2100"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Remarques</label>
                        <textarea
                          value={seanceForm.remarques}
                          onChange={(e) => setSeanceForm({
                            ...seanceForm,
                            remarques: e.target.value
                          })}
                          placeholder="Notes sur cette séance..."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Membres participants *</label>
                        <div className={styles.membersSelection}>
                          {membres.map(membre => (
                            <div key={membre.id_membre} className={styles.memberCheckbox}>
                              <input
                                type="checkbox"
                                id={`membre-${membre.id_membre}`}
                                checked={selectedMembres.includes(membre.id_membre)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembres([...selectedMembres, membre.id_membre]);
                                  } else {
                                    setSelectedMembres(selectedMembres.filter(id => id !== membre.id_membre));
                                  }
                                }}
                              />
                              <label htmlFor={`membre-${membre.id_membre}`}>
                                {membre.prenom_membre} {membre.nom_membre} ({membre.fonction_membre})
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className={styles.selectedCount}>
                          {selectedMembres.length} membre(s) sélectionné(s)
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => setMode('view')}
                        >
                          Annuler
                        </button>
                        <button
                          className={styles.saveButton}
                          onClick={handleCreateSeance}
                          disabled={selectedMembres.length === 0 || isLoading}
                        >
                          {isLoading ? 'Création en cours...' : 'Créer la séance'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comites Tab */}
              {activeTab === 'comites' && (
                <div className={styles.tabContent}>
                  {mode === 'view' ? (
                    <>
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h2 className={styles.cardTitle}>
                            <FiFileText /> Comités de Direction
                          </h2>
                          <button
                            className={styles.addButton}
                            onClick={handleCreateComite}
                            
                          >
                            <FiPlus /> Nouveau comité
                          </button>
                        </div>

                        {comites.length > 0 ? (
  <div className={styles.comiteList}>
    {comites.map(comite => (
      <div
        key={comite.id_comite}
        className={`${styles.comiteItem} ${selectedComite === comite.id_comite ? styles.selected : ''}`}
        onClick={() => setSelectedComite(comite.id_comite)}
      >
        <div className={styles.comiteHeader}>
          <h3>{comite.numero_decision}</h3>
          <span className={styles.comiteDate}>
            {new Date(comite.date_comite).toLocaleDateString()}
          </span>
        </div>
        <p className={styles.comiteObject}>{comite.objet_deliberation}</p>
        <div className={styles.comiteStats}>
  <span>
    {currentComite?.decisions?.filter(d => d.decision_cd === 'favorable').length || 0} favorable(s)
  </span>
  <span>
    {currentComite?.decisions?.filter(d => d.decision_cd === 'defavorable').length || 0} défavorable(s)
  </span>
</div>
      </div>
    ))}
  </div>
) : (
  <p className={styles.noData}>Aucun comité enregistré</p>
)}
                      </div>

                      {currentComite && (
                        <div className={styles.card}>
                          <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                              Décision {currentComite.numero_decision}
                            </h2>
                            <div className={styles.comiteActions}>
                              <button
                                className={styles.actionButton}
                                onClick={handleEditComite}
                                disabled={statutProc === 'TERMINEE' || !statutProc}
                              >
                                <FiEdit2 /> Modifier
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={generateReport}
                              >
                                <FiDownload /> Rapport
                              </button>
                            </div>
                          </div>

                          <div className={styles.comiteDetails}>
                            <div className={styles.detailRow}>
                              <div className={styles.detailItem}>
                                <strong>Date du comité:</strong> {new Date(currentComite.date_comite).toLocaleDateString()}
                              </div>
                             
                            </div>

                            <div className={styles.detailItem}>
                              <strong>Objet:</strong> {currentComite.objet_deliberation}
                            </div>

                            <div className={styles.detailItem}>
                              <strong>Résumé:</strong> {currentComite.resume_reunion}
                            </div>

                            <h3 className={styles.subTitle}>Documents joints</h3>
                            <div className={styles.documentsList}>
                              {currentComite.fiche_technique && (
                                <a href={currentComite.fiche_technique} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                                  Fiche technique
                                </a>
                              )}
                              {currentComite.carte_projettee && (
                                <a href={currentComite.carte_projettee} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                                  Carte projetée
                                </a>
                              )}
                              {currentComite.rapport_police && (
                                <a href={currentComite.rapport_police} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                                  Rapport police
                                </a>
                              )}
                            </div>

                            <h3 className={styles.subTitle}>Décisions</h3>
                            <div className={styles.decisionsGrid}>
  {(currentComite.decisions || []).map((decision, index) => (
    <div key={index} className={`${styles.decisionCard} ${decision.decision_cd === 'favorable' ? styles.favorable : styles.defavorable}`}>
                                  <div className={styles.decisionHeader}>
                                    <h4>
                                      {decision.decision_cd === 'favorable' ? (
                                        <><FiCheck /> Favorable</>
                                      ) : (
                                        <><FiX /> Défavorable</>
                                      )}
                                    </h4>
                                    {decision.duree_decision && (
                                      <span className={styles.durationBadge}>
                                        {decision.duree_decision} jours
                                      </span>
                                    )}
                                  </div>
                                  {decision.commentaires && (
                                    <p className={styles.decisionComment}>{decision.commentaires}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.card}>
                      <h2 className={styles.cardTitle}>
                        {selectedComite ? 'Modifier le comité' : 'Créer un nouveau comité'}
                      </h2>

                      <div className={styles.formGroup}>
                        <label>Séance associée *</label>
                        <select
                          value={selectedSeance || ''}
                          onChange={(e) => setSelectedSeance(Number(e.target.value))}
                          disabled={mode === 'edit'}
                        >
                          <option value="">Sélectionner une séance</option>
                          {seances.map(seance => (
                            <option key={seance.id_seance} value={seance.id_seance}>
                              {seance.num_seance} - {new Date(seance.date_seance).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Date du comité *</label>
                        <input
                          type="date"
                          value={comiteForm.date_comite}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            date_comite: e.target.value
                          })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Numéro de décision *</label>
                        <input
                          type="text"
                          value={comiteForm.numero_decision}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            numero_decision: e.target.value
                          })}
                          placeholder="CD-2024-001"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Objet de délibération *</label>
                        <input
                          type="text"
                          value={comiteForm.objet_deliberation}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            objet_deliberation: e.target.value
                          })}
                          placeholder="Objet principal de la réunion"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Résumé de la réunion</label>
                        <textarea
                          value={comiteForm.resume_reunion}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            resume_reunion: e.target.value
                          })}
                          placeholder="Compte-rendu des discussions..."
                          rows={4}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Documents joints</label>
                        <input
                          type="text"
                          value={comiteForm.fiche_technique}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            fiche_technique: e.target.value
                          })}
                          placeholder="Lien fiche technique"
                        />
                        <input
                          type="text"
                          value={comiteForm.carte_projettee}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            carte_projettee: e.target.value
                          })}
                          placeholder="Lien carte projetée"
                          className={styles.mt2}
                        />
                        <input
                          type="text"
                          value={comiteForm.rapport_police}
                          onChange={(e) => setComiteForm({
                            ...comiteForm,
                            rapport_police: e.target.value
                          })}
                          placeholder="Lien rapport police"
                          className={styles.mt2}
                        />
                      </div>

                      <h3 className={styles.subTitle}>Décisions</h3>
                      {comiteForm.decisions!.map((decision, index) => (
                        <div key={index} className={styles.decisionForm}>
                          <div className={styles.decisionButtons}>
                            <button
                              className={`${styles.decisionButton} ${decision.decision_cd === 'favorable' ? styles.active : ''}`}
                              onClick={() => updateDecision(index, 'decision_cd', 'favorable')}
                            >
                              <FiCheck /> Favorable
                            </button>
                            <button
                              className={`${styles.decisionButton} ${decision.decision_cd === 'defavorable' ? styles.active : ''}`}
                              onClick={() => updateDecision(index, 'decision_cd', 'defavorable')}
                            >
                              <FiX /> Défavorable
                            </button>
                          </div>

                          {decision.decision_cd === 'favorable' && (
                            <div className={styles.formGroup}>
                              <label>Durée (jours)</label>
                              <input
                                type="number"
                                value={decision.duree_decision || ''}
                                onChange={(e) => updateDecision(index, 'duree_decision', parseInt(e.target.value))}
                                min="1"
                                max="30"
                              />
                            </div>
                          )}

                          {decision.decision_cd === 'defavorable' && (
                            <div className={styles.formGroup}>
                              <label>Motif *</label>
                              <textarea
                                value={decision.commentaires || ''}
                                onChange={(e) => updateDecision(index, 'commentaires', e.target.value)}
                                placeholder="Raison du refus..."
                                rows={3}
                              />
                            </div>
                          )}

                          {comiteForm.decisions!.length > 1 && (
                            <button
                              className={styles.removeDecision}
                              onClick={() => removeDecision(index)}
                            >
                              <FiTrash2 /> Supprimer cette décision
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        className={styles.addDecision}
                        onClick={addDecision}
                      >
                        <FiPlus /> Ajouter une autre décision
                      </button>

                      <div className={styles.formActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => setMode('view')}
                        >
                          Annuler
                        </button>
                        <button
                          className={styles.saveButton}
                          onClick={handleSaveComite}
                          disabled={!selectedSeance || !comiteForm.numero_decision || !comiteForm.objet_deliberation || isSubmitting}
                        >
                          {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button 
                  onClick={() => router.push(`/renouvellement/step6/page6?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalIdStr}`)}
                  className={`${styles.btn} ${styles.btnOutline}`}
                >
                  <FiChevronLeft className={styles.btnIcon} />
                  Précédent
                </button>
                
                <button
                  className={styles.btnSave}
                  onClick={handleSaveEtape}
                  disabled={savingEtape || statutProc === 'TERMINEE' || !statutProc}
                >
                  {savingEtape ? (
                    <span className={styles.btnLoading}>
                      <span className={styles.spinnerSmall}></span>
                      Sauvegarde...
                    </span>
                  ) : (
                    <>
                      <FiFileText className={styles.btnIcon} />
                      Sauvegarder l'étape
                    </>
                  )}
                </button>
                
                <button 
                    onClick={handleNext}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={isSubmitting}
                  >
                        Suivant <FiChevronRight className={styles.btnIcon} />  
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