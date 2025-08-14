// pages/permis_dashboard/view/page.tsx
import React, { useState } from 'react';
import styles from './PermisView.module.css';
import { Calendar, Clock, MapPin, FileText, Building2, RefreshCw, Edit2, FileSearch, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import NotificationBanner from '../../../components/NotificationBanner';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

interface RenewalInfo {
  id: number;
  num_decision: string;
  date_decision: Date | null;
  date_debut_validite: Date | null;
  date_fin_validite: Date | null;
  duree_renouvellement: number;
  commentaire: string;
  nombre_renouvellements?: number; 
}

// Then update your PermisDetails interface
interface PermisDetails {
  id: number;
  code_permis: string;
  date_octroi: Date | null;
  date_expiration: Date | null;
  date_annulation: Date | null;
  date_renonciation: Date | null;
  superficie: number | null;
  nombre_renouvellements: number | null;
  statut: {
    lib_statut: string;
  } | null;
  typePermis: {
    lib_type: string;
    code_type: string;
    duree_renouv: number;
    nbr_renouv_max: number;
  };
  detenteur: {
    nom_sociétéFR: string;
  } | null;
  procedures: Procedure[];
  renewals: RenewalInfo[]; // Add this line
}


interface Procedure {
  id_proc: number;
  num_proc: string;
  date_debut_proc: Date;
  date_fin_proc: Date | null;
  statut_proc: string;
  typeProcedure: {
    libelle: string;
  };
  SubstanceAssocieeDemande: {
    substance: {
      id_sub: number;
      nom_subFR: string;
      nom_subAR: string;
      catégorie_sub: string;
    };
  }[];
  ProcedureEtape: {
    id_etape: number;
    statut: string;
    date_debut: Date;
    date_fin: Date | null;
    etape: {
      lib_etape: string;
      ordre_etape: number;
    };
  }[];
}



interface Props {
  permis: PermisDetails;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
const apiURL = process.env.NEXT_PUBLIC_API_URL;

  const id = context.query.id;

  try {
    const res = await fetch(`${apiURL}/Permisdashboard/${id}`);
    if (!res.ok) throw new Error('Failed to fetch permit');
    const permis = await res.json();
    if (!permis.typePermis.nbr_renouv_max) {
      const typeRes = await fetch(`${apiURL}/api/typepermis/${permis.id_typePermis}`);
      const typeData = await typeRes.json();
      permis.typePermis = {
        ...permis.typePermis,
        ...typeData
      };
    }
    const renewalsRes = await fetch(`${apiURL}/api/procedures/${id}/renewals`);
    const renewalsData = renewalsRes.ok ? await renewalsRes.json() : [];
    // Transform the data to match RenewalInfo
    const formattedRenewals = renewalsData.map((proc: any) => {
  // Ensure we have a valid renewal object
  if (!proc.renouvellement) return null;
  
  return {
    id: proc.id_proc,
    num_decision: proc.renouvellement.num_decision || null,
    date_decision: proc.renouvellement.date_decision || null,
    date_debut_validite: proc.renouvellement.date_debut_validite || null,
    date_fin_validite: proc.renouvellement.date_fin_validite || null,
    duree_renouvellement: proc.renouvellement.nombre_renouvellements || 0,
    commentaire: proc.renouvellement.commentaire || '',
  };
}).filter(Boolean); // Remove any null entries
    return {
      props: { 
        permis: {
          ...permis,
          renewals: formattedRenewals
        } 
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};


const PermisViewPage: React.FC<Props> = ({ permis }) => {
  const router = useRouterWithLoading();
  const [notif, setNotif] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Array<{message: string;type: 'error' | 'success' | 'info';}>>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [ShowCessionModal, setShowCessionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pendingPermisId, setPendingPermisId] = useState<number | null>(null);
  const [showMaxRenewalModal, setShowMaxRenewalModal] = useState(false);
const searchParams = useSearchParams();
const idPermis = searchParams!.get('id');
  const formatDate = (date: Date | null) => {
    return date ? format(new Date(date), 'PPP', { locale: fr }) : 'Non définie';
  };

  const procedureTypes = Array.from(
    new Set(permis.procedures.map(p => p.typeProcedure.libelle))
  );

   const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);

   const calculateValidityStatus = (expiryDate: Date | null) => {
  if (!expiryDate) return 'Inconnu';
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expiré';
  if (diffDays < 30) return 'Expire bientôt';
  return 'Valide';
};

const handleProcedureTypeClick = (type: string) => {
  const matchingProcedures = permis.procedures.filter(p => p.typeProcedure.libelle === type);
  if (matchingProcedures.length > 0) {
    setSelectedProcedures(matchingProcedures);
    setSelectedProcedure(matchingProcedures[0]); // default selection
    setIsModalOpen(true);
  }
};



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'EN_COURS':
        return styles.badgePrimary;
      case 'TERMINEE':
        return styles.badgeSuccess;
      case 'EN_ATTENTE':
        return styles.badgeWarning;
      case 'REJETEE':
      case 'ANNULEE':
        return styles.badgeDanger;
      default:
        return styles.badgeNeutral;
    }
  };

  const getProcedureBorderColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'EN_COURS': return '#6366f1';
      case 'TERMINEE': return '#10b981';
      case 'EN_ATTENTE': return '#f59e0b';
      case 'REJETEE': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  // Function to get all unique substances from all procedures
  const getAllSubstances = () => {
    const allSubstances: {
      id_sub: number;
      nom_subFR: string;
      nom_subAR: string;
      catégorie_sub: string;
    }[] = [];

    permis.procedures.forEach(procedure => {
      procedure.SubstanceAssocieeDemande.forEach(sub => {
        if (!allSubstances.some(s => s.id_sub === sub.substance.id_sub)) {
          allSubstances.push(sub.substance);
        }
      });
    });

    return allSubstances;
  };

 const handleViewProcedure = (procedure: Procedure) => {
  const isRenewal = procedure.typeProcedure.libelle.toLowerCase() === 'renouvellement';
  const currentStep = procedure.ProcedureEtape.find(step => step.statut === 'EN_COURS');

  let url: string;

  if (isRenewal) {
    // Find the original procedure (non-renouvellement)
    const original = permis.procedures.find(p => 
      p.typeProcedure.libelle.toLowerCase() !== 'renouvellement'
    );

    const originalDemandeId = original?.ProcedureEtape?.[0]?.id_etape || null;
    const originalProcId = original?.id_proc || null;

    if (currentStep) {
      url = `/renouvellement/step${currentStep.etape.ordre_etape}/page${currentStep.etape.ordre_etape}?id=${procedure.id_proc}`;
    } else {
      url = `/renouvellement/step2/page2?id=${procedure.id_proc}`;
    }

    // Add original params if found
    if (originalDemandeId && originalProcId) {
      url += `&originalDemandeId=${originalDemandeId}&original_proc_id=${originalProcId}`;
    }

  } else {
    // Non-renewal
    if (currentStep) {
      url = `/demande/step${currentStep.etape.ordre_etape}/page${currentStep.etape.ordre_etape}?id=${procedure.id_proc}`;
    } else {
      url = `/demande/step2/page2?id=${procedure.id_proc}`;
    }
  }

  window.open(url, '_blank');
};



 const handleRenewalClick = async (permisId: number) => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // First check if max renewals reached (just in case)
  if ((permis.renewals?.length || 0) >= permis.typePermis.nbr_renouv_max) {
    setShowMaxRenewalModal(true);
    return;
  }

  try {
    const response = await axios.post(`${apiURL}/api/procedures/renouvellement/check-payments`, {
      permisId,
    });

    setPendingPermisId(permisId);
    setShowDateModal(true);

  } catch (error: any) {
    let errorMessage = "Erreur inconnue";
    
    if (error.response) {
      errorMessage = error.response.data.message || error.response.statusText;
    } else if (error.request) {
      errorMessage = "Pas de réponse du serveur";
    } else {
      errorMessage = error.message;
    }
    
    setNotif({ 
      message: `⛔ ${errorMessage}`,
      type: 'error' 
    });
  }
};


const handleNotificationClose = () => {
  setNotif(null);
};


const handleSubmitDate = async () => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  if (!selectedDate || !pendingPermisId) return;

  try {
    const res = await axios.post(`${apiURL}/api/procedures/renouvellement/start`, {
      permisId: pendingPermisId,
      date_demande: selectedDate.toISOString().split('T')[0], 
    });

    const { original_demande_id, original_proc_id, new_proc_id } = res.data;

    router.push(
      `/renouvellement/step2/page2?id=${new_proc_id}&originalDemandeId=${original_demande_id}&original_proc_id=${original_proc_id}`
    );
  } catch (error: any) {
    setNotif({ message: 'Erreur lors du renouvellement.', type: 'error' });
  } finally {
    setShowDateModal(false);
    setPendingPermisId(null);
    setSelectedDate(null);
  }
};

  const substances = getAllSubstances();

// Vérification avant lancement de la cession
const handleCessionClick = async (permisId: number) => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await axios.post(`${apiURL}/api/procedures/cession/check-payments`, {
      permisId,
    });

    // Si tout est OK → on sauvegarde l'ID et on affiche la modal (date ou confirmation)
    setPendingPermisId(permisId);
    setShowCessionModal(true); // modal spécifique à la cession

  } catch (error: any) {
    let errorMessage = "Erreur inconnue";
    
    if (error.response) {
      errorMessage = error.response.data.message || error.response.statusText;
    } else if (error.request) {
      errorMessage = "Pas de réponse du serveur";
    } else {
      errorMessage = error.message;
    }
    
    setNotif({ 
      message: `⛔ ${errorMessage}`,
      type: 'error' 
    });
  }
};

//Lancer réellement la procédure de cession
const handleSubmitCession = async () => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  if (!selectedDate || !pendingPermisId) return;

  try {
    const res = await axios.post(`${apiURL}/api/procedures/cession/start`, {
      permisId: pendingPermisId,
      date_demande: selectedDate.toISOString().split('T')[0], 
    });

    const { original_demande_id, original_proc_id, new_proc_id } = res.data;

    router.push(
      `/cession/step1/page1?id=${new_proc_id}&originalDemandeId=${original_demande_id}&original_proc_id=${original_proc_id}`
    );
  } catch (error: any) {
    setNotif({ message: 'Erreur lors de la cession.', type: 'error' });
  } finally {
    setShowCessionModal(false);
    setPendingPermisId(null);
    setSelectedDate(null);
  }
};

  return (
  <div className={styles.container}>
    {notif && (
  <NotificationBanner
    message={notif.message}
    type={notif.type}
    onClose={handleNotificationClose}
  />
)}

    <div className={styles.header}>
      <h1 className={styles.headerTitle}>Détails du Permis</h1>
      <p className={styles.headerSubtitle}>
        Informations complètes sur le permis {permis.code_permis}
      </p>
    </div>

    <div className={styles.gridLayout}>
      {/* Main Content */}
      <div className="space-y-6">
        {/* General Info Card */}
        <div className={`${styles.card} ${styles.animateIn}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FileText size={20} />
            </div>
            <h2 className={styles.cardTitle}>Informations générales</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Code Permis</span>
                <span className={styles.infoValue}>{permis.code_permis}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Type de Permis</span>
                <span className={styles.infoValue}>
                  {permis.typePermis.lib_type} ({permis.typePermis.code_type})
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Statut</span>
                <span className={`${styles.badge} ${getStatusColor(permis.statut?.lib_statut || '')}`}>
                  {permis.statut?.lib_statut || 'Inconnu'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Superficie</span>
                <span className={styles.infoValue}>
                  {permis.superficie ? `${permis.superficie} Ha` : 'Non définie'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Titulaire</span>
                <span className={styles.infoValue}>
                  {permis.detenteur?.nom_sociétéFR || 'Non défini'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Substances</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {substances.length > 0 ? (
                    substances.map((substance) => (
                      <span key={substance.id_sub} className={`${styles.badge} ${styles.badgePrimary}`}>
                        {substance.nom_subFR}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Non spécifiées</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dates Card */}
        <div className={`${styles.card} ${styles.animateIn} ${styles.delay1}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Calendar size={20} />
            </div>
            <h2 className={styles.cardTitle}>Dates importantes</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date d'octroi</span>
                <span className={styles.infoValue}>{formatDate(permis.date_octroi)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date d'expiration</span>
                <span className={styles.infoValue}>{formatDate(permis.date_expiration)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date d'annulation</span>
                <span className={styles.infoValue}>{formatDate(permis.date_annulation)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date de renonciation</span>
                <span className={styles.infoValue}>{formatDate(permis.date_renonciation)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.animateIn} ${styles.delay1}`}>
  <div className={styles.cardHeader}>
    <div className={styles.cardHeaderIcon}>
      <RefreshCw size={20} />
    </div>
    <h2 className={styles.cardTitle}>Historique des Renouvellements</h2>
  </div>
  <div className={styles.cardContent}>
    {/* Debug log moved outside JSX */}
    {(() => {
      console.log('Current renewals data:', permis.renewals);
      return null;
    })()}
    
    {permis.renewals && permis.renewals.some(r => r.num_decision && r.num_decision !== 'N/A') ? (
      <div className={styles.renewalTimeline}>
        {permis.renewals
          .filter(r => r.num_decision && r.num_decision !== 'N/A')
          .map((renewal, index) => (
            <div key={renewal.id} className={styles.renewalItem}>
            <div className={styles.renewalMarker}>
              <div className={styles.renewalNumber}>{index + 1}</div>
              <div className={styles.renewalConnector}></div>
            </div>
            <div className={styles.renewalDetails}>
              <div className={styles.renewalHeader}>
                <span className={styles.renewalDecision}>Décision: {renewal.num_decision}</span>
                <span className={styles.renewalDate}>
                  {formatDate(renewal.date_decision)}
                </span>
              </div>
              <div className={styles.renewalPeriod}>
                <span>Période: {formatDate(renewal.date_debut_validite)} - {formatDate(renewal.date_fin_validite)}</span>
                <span className={styles.renewalDuration}>
                  ({permis.typePermis.duree_renouv} {permis.typePermis.duree_renouv > 1 ? 'ans' : 'an'})
                </span>
              </div>
              {renewal.commentaire && (
                <div className={styles.renewalComment}>
                  <strong>Commentaire:</strong> {renewal.commentaire}
                </div>
              )}
              <div 
  className={styles.renewalLimitWarning}
  onClick={() => {
    if (permis.nombre_renouvellements! >= permis.typePermis.nbr_renouv_max) {
      setShowMaxRenewalModal(true);
    }
  }}
  style={{
    cursor: permis.nombre_renouvellements! >= permis.typePermis.nbr_renouv_max ? 'pointer' : 'default'
  }}
>
  {permis.nombre_renouvellements && permis.typePermis.nbr_renouv_max && (
    <>
      <div className={styles.renewalProgress}>
        <div 
          className={styles.renewalProgressBar}
          style={{
            width: `${Math.min(100, (permis.nombre_renouvellements / permis.typePermis.nbr_renouv_max) * 100)}%`
          }}
        ></div>
      </div>
      <div className={styles.renewalLimitText}>
        {permis.nombre_renouvellements} / {permis.typePermis.nbr_renouv_max} renouvellements utilisés
      </div>
      {permis.nombre_renouvellements >= permis.typePermis.nbr_renouv_max && (
        <div className={styles.renewalMaxReached}>
          <XCircle size={16} />
          <span>Maximum de renouvellements atteint</span>
        </div>
      )}
    </>
  )}
</div>
            </div>
          </div>
          ))
        }
        <div className={styles.currentStatus}>
          <div className={styles.statusLabel}>Statut actuel:</div>
          <div className={`${styles.statusValue} ${
            calculateValidityStatus(permis.date_expiration) === 'Valide' ? styles.statusValid :
            calculateValidityStatus(permis.date_expiration) === 'Expire bientôt' ? styles.statusWarning :
            styles.statusExpired
          }`}>
            {calculateValidityStatus(permis.date_expiration)}
            {permis.date_expiration && (
              <span className={styles.statusDate}>
                (jusqu'au {formatDate(permis.date_expiration)})
              </span>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className={styles.noRenewals}>
        Ce permis n'a pas encore été renouvelé.
      </div>
    )}
  </div>
</div>
        {/* Procedures Card */}
        <div className={`${styles.card} ${styles.animateIn} ${styles.delay2}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Clock size={20} />
            </div>
            <h2 className={styles.cardTitle}>Procédures associées</h2>
          </div>
          <div className={styles.cardContent}>
            {/* Procedure Types Section */}
            <div className={styles.procedureTypes}>
  <h3 className={styles.procedureTypesTitle}>Types de procédures</h3>
  <div className={styles.procedureTypesList}>
    {procedureTypes.map(type => (
      <button
        key={type}
        onClick={() => handleProcedureTypeClick(type)}
        className={styles.procedureTypeBadge}
      >
        {type}
      </button>
    ))}
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
  {/* Quick Actions Card */}
  <div className={`${styles.card} ${styles.animateIn} ${styles.delay1}`}>
    <div className={styles.cardHeader}>
      <div className={styles.cardHeaderIcon}>
        <Building2 size={20} />
      </div>
      <h2 className={styles.cardTitle}>Actions rapides</h2>
    </div>
    <div className={styles.cardContent}>
<button 
  className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
  disabled={permis.typePermis.code_type === 'PEM'}
  onClick={() => {
    if ((permis.renewals?.length || 0) >= permis.typePermis.nbr_renouv_max) {
      setShowMaxRenewalModal(true);
    } else {
      handleRenewalClick(permis.id);
    }
  }}
  style={{
    position: 'relative',
    opacity: (permis.typePermis.code_type === 'PEM' || 
             (permis.renewals?.length || 0) >= permis.typePermis.nbr_renouv_max) ? 0.7 : 1,
    cursor: (permis.typePermis.code_type === 'PEM' || 
             (permis.renewals?.length || 0) >= permis.typePermis.nbr_renouv_max) ? 'not-allowed' : 'pointer'
  }}
>
  <RefreshCw size={18} />
  Demander un renouvellement
  {(permis.nombre_renouvellements || 0) >= permis.typePermis.nbr_renouv_max && (
    <span className={styles.tooltip}>
      Maximum de {permis.typePermis.nbr_renouv_max} renouvellements atteint
    </span>
  )}
</button>
      <button 
        className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
        // disabled={permis.typePermis.code_type === 'PEM'}
        // style={{
        //   opacity: permis.typePermis.code_type === 'PEM' ? 0.5 : 1,
        //   cursor: permis.typePermis.code_type === 'PEM' ? 'not-allowed' : 'pointer'
        // }}
      >
        <Edit2 size={18} />
        Demander une modification
      </button>
      <button
        className={`${styles.actionButton} ${styles.actionButtonInfo}`}
        // disabled={permis.typePermis.code_type === 'PEM'}
        onClick={() => {
            handleCessionClick(permis.id);
        }}
        // style={{
        //   opacity: permis.typePermis.code_type === 'PEM' ? 0.5 : 1,
        //   cursor: permis.typePermis.code_type === 'PEM' ? 'not-allowed' : 'pointer'
        // }}
      >
        <ChevronRight size={18} />
        Demander une cession
      </button>
      <button 
        className={`${styles.actionButton} ${styles.actionButtonWarning}`}
      //  disabled={permis.typePermis.code_type === 'PEM'}
      //   style={{
      //     opacity: permis.typePermis.code_type === 'PEM' ? 0.5 : 1,
      //     cursor: permis.typePermis.code_type === 'PEM' ? 'not-allowed' : 'pointer'
      //   }}
      >
        <FileSearch size={18} />
        Consulter les documents
      </button>
      <button 
        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
        // disabled={permis.typePermis.code_type === 'PEM'}
        // style={{
        //   opacity: permis.typePermis.code_type === 'PEM' ? 0.5 : 1,
        //   cursor: permis.typePermis.code_type === 'PEM' ? 'not-allowed' : 'pointer'
        // }}
      >
        <XCircle size={18} />
        Demander une renonciation
      </button>
    </div>
  </div>
</div>
</div>
    {/* Procedure Modal */}
{isModalOpen && selectedProcedure && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button 
        onClick={() => setIsModalOpen(false)} 
        className={styles.modalCloseButton}
      >
        <XCircle size={20} />
      </button>
      
      <h2 className={styles.modalTitle}>
        {selectedProcedure.typeProcedure.libelle} - {selectedProcedure.num_proc}
      </h2>
      
      <div className={styles.modalBody}>
        <div className={styles.modalProcedureInfo}>
          <div className={styles.modalProcedureDates}>
            <span>Début: {formatDate(selectedProcedure.date_debut_proc)}</span>
            <span> - </span>
            <span>Fin: {formatDate(selectedProcedure.date_fin_proc)}</span>
          </div>
          <div className={`${styles.badge} ${getStatusColor(selectedProcedure.statut_proc)}`}>
            {selectedProcedure.statut_proc}
          </div>
        </div>
        {/* Add this here before the modalStepsContainer */}
{selectedProcedures.length > 1 && (
  <div className={styles.procedureSelector}>
    <label className={styles.procedureSelectorLabel}>Choisir une procédure :</label>
    <select
      className={styles.procedureSelectorDropdown}
      value={selectedProcedure?.id_proc}
      onChange={(e) => {
        const freshProc = permis.procedures.find(p => p.id_proc === Number(e.target.value));
        if (freshProc) setSelectedProcedure(freshProc);
      }}
    >
      {selectedProcedures.map(p => (
        <option key={p.id_proc} value={p.id_proc}>
          {p.num_proc} - {formatDate(p.date_debut_proc)}
        </option>
      ))}
    </select>
  </div>
)}


        <div className={styles.modalStepsContainer}>
          {selectedProcedure.ProcedureEtape.map((step) => (
            <div key={step.id_etape} className={styles.stepItem}>
              <div 
                className={styles.stepIndicator} 
                style={{
                  backgroundColor: step.statut === 'TERMINEE' ? '#10b981' :
                                  step.statut === 'EN_ATTENTE' ? '#6366f1' : '#e2e8f0',
                  color: step.statut === 'EN_ATTENTE' ? '#64748b' : 'white'
                }}
              >
                {step.etape.ordre_etape}
              </div>
              <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>{step.etape.lib_etape}</h4>
                <div className={styles.stepDates}>
                  {formatDate(step.date_debut)} - {formatDate(step.date_fin)}
                </div>
                <span className={`${styles.badge} ${getStatusColor(step.statut)}`}>
                  {step.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          onClick={() => setIsModalOpen(false)}
          className={styles.modalSecondaryButton}
        >
          Fermer
        </button>
        <button
          onClick={() => {
            setIsModalOpen(false);
            handleViewProcedure(selectedProcedure);
          }}
          className={styles.modalPrimaryButton}
        >
          Voir la procédure
        </button>
      </div>
    </div>
  </div>
)}

{showDateModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h2 className={styles.modalTitle}>Demande de renouvellement</h2>
      
      <div className={styles.modalInfoText}>
        <p>Renouvellements restants: {permis.typePermis.nbr_renouv_max - (permis.nombre_renouvellements || 0)}/{permis.typePermis.nbr_renouv_max}</p>
        <p>Vous pouvez effectuer {permis.typePermis.nbr_renouv_max - (permis.nombre_renouvellements || 0)} renouvellement(s) supplémentaire(s)</p>
      </div>

      <h3 className={styles.modalSubtitle}>Choisir une date de demande</h3>

      <input
        type="date"
        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className={styles.modalDateInput}
      />

      <div className={styles.modalFooter}>
        <button
          onClick={() => {
            setShowDateModal(false);
            setSelectedDate(null);
          }}
          className={styles.modalSecondaryButton}
        >
          Annuler
        </button>
        <button
          onClick={handleSubmitDate}
          disabled={!selectedDate}
          className={styles.modalPrimaryButton}
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
)}
{ShowCessionModal&& (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h2 className={styles.modalTitle}>Demande de Cession</h2>
      

      <h3 className={styles.modalSubtitle}>Choisir une date de demande</h3>

      <input
        type="date"
        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className={styles.modalDateInput}
      />

      <div className={styles.modalFooter}>
        <button
          onClick={() => {
            setShowCessionModal(false);
            setSelectedDate(null);
          }}
          className={styles.modalSecondaryButton}
        >
          Annuler
        </button>
        <button
          onClick={handleSubmitCession}
          disabled={!selectedDate}
          className={styles.modalPrimaryButton}
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
)}

{showMaxRenewalModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button 
        onClick={() => setShowMaxRenewalModal(false)} 
        className={styles.modalCloseButton}
      >
        <XCircle size={20} />
      </button>
      
      <div className={styles.modalIconWarning}>
        <XCircle size={48} className={styles.warningIcon} />
      </div>
      
      <h2 className={styles.modalTitle}>Limite de renouvellements atteinte</h2>
      
      <div className={styles.modalBody}>
        <p>
          <strong>Type de permis:</strong> {permis.typePermis.lib_type} ({permis.typePermis.code_type})
        </p>
        <p>
          <strong>Renouvellements effectués:</strong> {permis.nombre_renouvellements || 0} / {permis.typePermis.nbr_renouv_max}
        </p>
        <div className={styles.modalWarningText}>
          Ce permis a atteint le nombre maximum de renouvellements autorisés.
          Vous ne pouvez pas effectuer de nouveaux renouvellements pour ce permis.
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          onClick={() => setShowMaxRenewalModal(false)}
          className={styles.modalPrimaryButton}
        >
          Compris
        </button>
      </div>
    </div>
  </div>
)}

  </div>
);
}

export default PermisViewPage;