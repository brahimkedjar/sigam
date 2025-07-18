'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  FiSearch, FiChevronRight, FiClock,
  FiAlertTriangle, FiCheck, FiX,
  FiTrash2
} from 'react-icons/fi';
import styles from './suivi.module.css';
import Navbar from '../navbar/Navbar';
import dynamic from 'next/dynamic';
const Sidebar = dynamic(() => import('../sidebar/Sidebar'), { ssr: false });
import { useAuthStore } from '@/store/useAuthStore';
import { useViewNavigator } from '@/hooks/useViewNavigator';
import { STEP_LABELS } from '@/constants/steps';

interface Demande {
  id_demande: number;
  code_demande: string;
  date_instruction: string;
  type_permis_demande: string;
  procedure: {
    id_proc: number;
    statut_proc: string;
    typeProcedure: {
      nom: string;
    };
    ProcedureEtape: ProcedureEtape[];
  };
  detenteur?: {
    nom_sociétéFR?: string;
  };
}

interface ProcedureEtape {
  statut: string;
  etape?: {
    lib_etape: string;
    ordre_etape:number;
  };
}

const LIB_PHASES = STEP_LABELS ;

const STATUS_CONFIG = {
  'Type de permis': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="text-blue-500" /> },
  'Identification': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="text-blue-500" /> },
  'Capacités': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="text-blue-500" /> },
  'Substances & Travaux': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="text-blue-500" /> },
  'Documents': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiAlertTriangle className="text-yellow-500" /> },
  'Cadastre': { bg: 'bg-orange-300', text: 'text-orange-800', icon: <FiClock className="text-orange-500" /> },
  'Avis Wali': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FiClock className="text-orange-500" /> },
  'Comité de direction': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FiClock className="text-purple-500" /> },
  'Génération du permis': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheck className="text-green-500" /> },
  'Paiement': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiClock className="text-green-500" /> },
  'en_instruction': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock className="text-blue-500" /> },
  'avis_wilaya': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FiClock className="text-orange-500" /> },
  'retard': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiAlertTriangle className="text-red-500" /> },
  'acceptée': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheck className="text-green-500" /> },
  'rejete': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="text-red-500" /> },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FiClock className="text-gray-500" /> }
};

export default function SuiviDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentView, navigateTo } = useViewNavigator('procedures');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { auth, isLoaded, hasPermission } = useAuthStore();
  const [procedureToDelete, setProcedureToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;


    if (!auth.role && auth.permissions.length === 0) {
      router.push('/');
      return;
    }
  }, [isLoaded, auth, currentView]);


  const [filters, setFilters] = useState({
    procedureType: 'Tous les types',
    permitCode: 'Tous les codes',
    sector: 'Mine',
    phase: 'Toutes les phases'
  });

  useEffect(() => {
    if (currentView === 'procedures') {
      const fetchDemandes = async () => {
        try {
          const res = await axios.get('http://localhost:3001/api/procedures');
          setDemandes(res.data);
        } catch (err) {
          console.error("Erreur de chargement des demandes :", err);
          setError("Erreur lors du chargement des demandes");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDemandes();
    }
  }, [currentView]);

  const goToEtape = async (idProc: number) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:3001/api/procedure-etape/current/${idProc}`);
      const etape = res.data?.etape?.ordre_etape;

      if (etape) {
        router.push(`/demande/step${etape}/page${etape}?id=${idProc}`);
      } else {
        setError("Étape introuvable");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'étape :", err);
      setError("Impossible de récupérer l'étape actuelle");
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
  };

  const filteredDemandes = demandes.filter((d) => {
  const matchesSearch =
    d.code_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.detenteur?.nom_sociétéFR?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesProcedureType =
    filters.procedureType === 'Tous les types' ||
    d.procedure?.typeProcedure?.nom === filters.procedureType;

  const matchesPermitCode =
    filters.permitCode === 'Tous les codes' ||
    d.type_permis_demande === filters.permitCode;

  function getCurrentPhase(etapes: ProcedureEtape[]): ProcedureEtape | undefined {
  const enCours = etapes.find(et => et.etape && LIB_PHASES.includes(et.etape.lib_etape) && et.statut === 'EN_COURS');

  if (enCours) return enCours;

  return etapes
    .filter(et => et.etape && LIB_PHASES.includes(et.etape.lib_etape) && et.statut === 'EN_COURS')
    .sort((a, b) => (b.etape!.ordre_etape ?? 0) - (a.etape!.ordre_etape ?? 0))[0];
}

const currentPhase = getCurrentPhase(d.procedure?.ProcedureEtape || []);

  const currentPhaseName = currentPhase?.etape?.lib_etape || 'Non démarrée';
  
  const matchesPhase =
    filters.phase === 'Toutes les phases' ||
    currentPhaseName === filters.phase;

  return matchesSearch && matchesProcedureType && matchesPermitCode && matchesPhase;
});

  const handleDeleteProcedure = async (procedureId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette procédure et toutes ses données associées ? Cette action est irréversible.")) {
      // Optimistically remove the procedure from state
      setDemandes(prevDemandes =>
        prevDemandes.filter(d => d.procedure.id_proc !== procedureId)
      );

      try {
        const response = await fetch(`http://localhost:3001/api/procedures/${procedureId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // If the deletion fails, we might want to re-fetch the data
          const res = await axios.get('http://localhost:3001/api/procedures/en-cours');
          setDemandes(res.data);
          throw new Error("Échec de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };
  const renderViewContent = () => {
  switch (currentView) {
    case 'procedures':
      return (
        <>
          <div className={styles.breadcrumb}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Dashboard</span>
          </div>
          <div className={styles['header-section']}>
            <h1 className={styles['page-title']}>
              Suivi des demandes en cours d'instruction
            </h1>
            <p className={styles['page-subtitle']}>
              Consultez, filtrez et gérez les demandes de permis en attente de traitement
            </p>
          </div>
          {error && (
            <div className={styles['error-message']}>
              <FiAlertTriangle className={styles['error-icon']} />
              <p>{error}</p>
            </div>
          )}

          {/* Filters Section */}
          <div className={styles['filters-card']}>
            <div className={styles['filters-header']}>
              <h2 className={styles['filters-title']}>Filtres de recherche</h2>
            </div>

            <div className={styles['filters-grid']}>
              <div className={styles['filter-group']}>
                <label className={styles['filter-label']}>Type de procédure</label>
                <select
                  className={styles['filter-select']}
                  value={filters.procedureType}
                  onChange={(e) => setFilters({ ...filters, procedureType: e.target.value })}
                >
                  <option>Tous les types</option>
                  <option>Extension PEM</option>
                  <option>Demande initiale ARM</option>
                  <option>Renouvellement PEM</option>
                  <option>Transfert POM</option>
                  <option>Fermeture PEM</option>
                </select>
              </div>

              <div className={styles['filter-group']}>
                <label className={styles['filter-label']}>Code permis</label>
                <select
                  className={styles['filter-select']}
                  value={filters.permitCode}
                  onChange={(e) => setFilters({ ...filters, permitCode: e.target.value })}
                >
                  <option>Tous les codes</option>
                  <option>PGM</option>
                  <option>ARM</option>
                  <option>POM</option>
                </select>
              </div>

              <div className={styles['filter-group']}>
                <label className={styles['filter-label']}>Secteur</label>
                <div className={styles['radio-group']}>
                  <label
                    className={`${styles['radio-option']} ${filters.sector === 'Mine' ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name="sector"
                      checked={filters.sector === 'Mine'}
                      onChange={() => setFilters({ ...filters, sector: 'Mine' })}
                    />
                    <span className={styles['radio-custom']}></span>
                    Mine
                  </label>
                  <label
                    className={`${styles['radio-option']} ${filters.sector === 'Carrière' ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name="sector"
                      checked={filters.sector === 'Carrière'}
                      onChange={() => setFilters({ ...filters, sector: 'Carrière' })}
                    />
                    <span className={styles['radio-custom']}></span>
                    Carrière
                  </label>
                </div>
              </div>

              <div className={styles['filter-group']}>
                <label className={styles['filter-label']}>Phase actuelle</label>
                <select
                  className={styles['filter-select']}
                  value={filters.phase}
                  onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                >
                  <option>Toutes les phases</option>
                  <option>Type de permis</option>
                  <option>Identification</option>
                  <option>Capacités</option>
                  <option>Substances & Travaux</option>
                  <option>Documents</option>
                  <option>Cadastre</option>
                  <option>Avis Wali</option>
                  <option>Comité de direction</option>
                  <option>Paiement</option>
                  <option>Génération du permis</option>
                </select>
              </div>
            </div>

            <div className={styles['search-group']}>
              <div className={styles['search-container']}>
                <FiSearch className={styles['search-icon']} />
                <input
                  type="text"
                  className={styles['search-input1']}
                  placeholder="Rechercher par code ou titulaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Demandes Table */}
          <div className={styles['table-container']}>
            {isLoading ? (
              <div className={styles['loading-state']}>
                <div className={styles.spinner}></div>
                <p>Chargement des demandes...</p>
              </div>
            ) : (
              <div className={styles['table-responsive']}>
                <table className={styles['suivi-table']}>
                  <thead>
                    <tr>
                      <th>CODE DEMANDE</th>
                      <th>TITULAIRE</th>
                      <th>TYPE DE PROCÉDURE</th>
                      <th>CODE PERMIS</th>
                      <th>DATE DEMANDE</th>
                      <th>STATUT</th>
                      <th>PHASE ACTUELLE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDemandes.map((d: any) => {
  console.log('>>> ProcedureEtapes:', d.procedure?.ProcedureEtape);

  const currentPhase = (d.procedure?.ProcedureEtape || []).find(
    (et: any) =>
      et.etape &&
      et.etape.lib_etape &&
      LIB_PHASES.includes(et.etape.lib_etape) &&
      et.statut === 'EN_COURS'
  );

  console.log('>>> Current Phase:', currentPhase);


                      const phaseConfig = currentPhase
                        ? STATUS_CONFIG[
                            currentPhase.etape.lib_etape as keyof typeof STATUS_CONFIG
                          ]
                        : STATUS_CONFIG.default;

                      const statusConfig = getStatusConfig(d.procedure?.statut_proc);

                      return (
                        <tr key={d.id_demande}>
                          <td>{d.code_demande}</td>
                          <td>{d.detenteur?.nom_sociétéFR || '---'}</td>
                          <td>{d.procedure?.typeProcedure?.description || '---'}</td>
                          <td>{d.type_permis_demande}</td>
                          <td>{new Date(d.date_demande).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <div
                              className={`${styles['status-tag']} ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              {statusConfig.icon}
                              {getStatutLabel(d.procedure?.statut_proc)}
                            </div>
                          </td>
                          <td>
                            {currentPhase ? (
                              <div
                                className={`${styles['status-tag']} ${phaseConfig.bg} ${phaseConfig.text}`}
                              >
                                {phaseConfig.icon}
                                {currentPhase.etape.lib_etape}
                              </div>
                            ) : (
                              <div
                                className={`${styles['status-tag']} bg-gray-100 text-gray-800`}
                              >
                                <FiClock className="text-gray-500" />
                                Non démarrée
                              </div>
                            )}
                          </td>
                          <td>
                            <div className={styles['actions-container']}>
                              <button
                                className={`${styles['action-btn']} ${styles['action-btn-primary']}`}
                                onClick={() => goToEtape(d.procedure.id_proc)}
                              >
                                <FiChevronRight className={styles['btn-icon']} />
                                Continuer
                              </button>

                              <button
                                className={`${styles['action-btn']} ${styles['action-btn-danger']}`}
                                onClick={() => setProcedureToDelete(d.procedure.id_proc)}
                              >
                                <FiTrash2 className={styles['btn-icon']} />
                                Supprimer
                              </button>
                            </div>

                            {procedureToDelete === d.procedure.id_proc && (
                              <div className={styles['confirmation-modal']}>
                                <div className={styles['modal-content']}>
                                  <h3 className={styles['modal-title']}>Confirmer la suppression</h3>
                                  <p className={styles['modal-body']}>
                                    Êtes-vous sûr de vouloir supprimer cette procédure et toutes ses
                                    données associées ? Cette action est irréversible.
                                  </p>
                                  <div className={styles['modal-actions']}>
                                    <button
                                      className={styles['modal-cancel-btn']}
                                      onClick={() => setProcedureToDelete(null)}
                                    >
                                      Annuler
                                    </button>
                                    <button
                                      className={styles['modal-confirm-btn']}
                                      onClick={async () => {
                                        await handleDeleteProcedure(procedureToDelete!);
                                        setProcedureToDelete(null);
                                      }}
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      );
    default:
      return null;
  }
};

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.appContent}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles.mainContent}>
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
}

// Helper functions
function getStatutLabel(statut: string) {
  switch (statut) {
    case 'en_instruction': return 'En instruction';
    case 'avis_wilaya': return 'Avis Wilaya';
    case 'Comité de direction': return 'CD à convoquer';
    case 'retard': return 'En retard';
    case 'acceptée': return 'ACEPTEE';
    case 'rejete': return 'REJETEE';
    case 'Documents': return 'Réserves';
    default: return statut || '---';
  }
}