// components/DecisionTracking.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import styles from './DecisionTracking.module.css'; 

// API URL from environment variables
const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function DecisionTracking() {
  const [data, setData] = useState<{
    decisions: any[];
    stats: { total: number; approved: number; rejected: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Inline API functions
  const getDecisionTracking = async () => {
    const response = await fetch(`${apiURL}/api/decision-tracking`);
    if (!response.ok) {
      throw new Error('Failed to fetch decision tracking data');
    }
    return response.json();
  };

  const getProcedureDetails = async (id: number) => {
    const response = await fetch(`${apiURL}/api/decision-tracking/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch procedure details');
    }
    return response.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDecisionTracking();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDecisionModal = async (id: number) => {
    setDetailLoading(true);
    try {
      const details = await getProcedureDetails(id);
      setSelectedDecision(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Suivi des Décisions du Comité</h1>
          <p className={styles.subtitle}>Consulter les décisions et générer les titres miniers</p>
        </div>
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

      {data && (
        <>
          <div className={styles.statsContainer}>
            <div className={`${styles.statCard} ${styles.statCardTotal}`}>
              <div className={styles.statValue}>{data.stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardApproved}`}>
              <div className={styles.statValue}>{data.stats.approved}</div>
              <div className={styles.statLabel}>Approuvées</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardRejected}`}>
              <div className={styles.statValue}>{data.stats.rejected}</div>
              <div className={styles.statLabel}>Rejetées</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Décisions du Comité</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.decisionsTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Permis</th>
                  <th className={styles.tableHeaderCell}>Société</th>
                  <th className={styles.tableHeaderCell}>Type</th>
                  <th className={styles.tableHeaderCell}>Séance</th>
                  <th className={styles.tableHeaderCell}>Décision</th>
                  <th className={styles.tableHeaderCell}>Date</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.decisions.map((decision) => {
                  const decisionData = decision.seance?.comites?.[0]?.decisionCDs?.[0];
                  const companyName = decision.demandes?.[0]?.detenteur?.nom_sociétéFR;
                  const initials = companyName?.match(/\b(\w)/g)?.join('').substring(0, 2).toUpperCase();
                  
                  return (
                    <tr key={decision.id_proc} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.permisCell}`}>
                        {decision.num_proc}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.societyCell}>
                          <div className={styles.societyAvatar}>
                            {initials || 'NA'}
                          </div>
                          {companyName || 'N/A'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {decision.typeProcedure?.libelle || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        {decision.seance?.num_seance || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        {decisionData ? (
                          <span className={`${styles.decisionBadge} ${
                            decisionData.decision_cd === 'favorable' 
                              ? styles.badgeApproved 
                              : styles.badgeRejected
                          }`}>
                            {decisionData.decision_cd === 'favorable' ? 'Approuvée' : 'Rejetée'}
                          </span>
                        ) : (
                          <span className={styles.decisionBadge}>En attente</span>
                        )}
                      </td>
                      <td className={`${styles.tableCell} ${styles.dateCell}`}>
                        {decision.seance?.comites?.[0]?.date_comite 
                          ? format(new Date(decision.seance.comites[0].date_comite), 'dd/MM/yyyy') 
                          : 'N/A'}
                      </td>
                      <td className={`${styles.tableCell} ${styles.actionCell}`}>
                        <button 
                          onClick={() => openDecisionModal(decision.id_proc)}
                          className={styles.viewButton}
                          disabled={detailLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {detailLoading && decision.id_proc === selectedDecision?.id_proc ? 'Chargement...' : 'Voir'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedDecision && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDecision(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Détails de la décision - {selectedDecision.num_proc}
              </h2>
              <button className={styles.closeButton} onClick={() => setSelectedDecision(null)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h3 className={styles.sectionTitle}>Informations de la Procédure</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Permis</div>
                  <div className={styles.infoValue}>{selectedDecision.num_proc}</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Société</div>
                  <div className={styles.infoValue}>
                    {selectedDecision.demandes?.[0]?.detenteur?.nom_sociétéFR || 'N/A'}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Type</div>
                  <div className={styles.infoValue}>
                    {selectedDecision.typeProcedure?.libelle || 'N/A'}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Date début</div>
                  <div className={styles.infoValue}>
                    {format(new Date(selectedDecision.date_debut_proc), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Date fin</div>
                  <div className={styles.infoValue}>
                    {selectedDecision.date_fin_proc 
                      ? format(new Date(selectedDecision.date_fin_proc), 'dd/MM/yyyy') 
                      : 'N/A'}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Statut</div>
                  <div className={styles.infoValue}>
                    {selectedDecision.statut_proc}
                  </div>
                </div>
              </div>

              <h3 className={styles.sectionTitle}>Décision du Comité</h3>
              <div className={styles.decisionDetails}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoLabel}>Séance</div>
                    <div className={styles.infoValue}>
                      {selectedDecision.seance?.num_seance || 'N/A'}
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <div className={styles.infoLabel}>Date décision</div>
                    <div className={styles.infoValue}>
                      {selectedDecision.seance?.comites?.[0]?.date_comite 
                        ? format(new Date(selectedDecision.seance.comites[0].date_comite), 'dd/MM/yyyy') 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <div className={styles.infoLabel}>Décision</div>
                    <div className={styles.infoValue}>
                      {selectedDecision.seance?.comites?.[0]?.decisionCDs?.[0]?.decision_cd 
                        ? selectedDecision.seance.comites[0].decisionCDs[0].decision_cd === 'favorable' 
                          ? 'Favorable' 
                          : 'Défavorable'
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <div className={styles.infoLabel}>Durée (années)</div>
                    <div className={styles.infoValue}>
                      {selectedDecision.seance?.comites?.[0]?.decisionCDs?.[0]?.duree_decision || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedDecision.seance?.comites?.[0]?.decisionCDs?.[0]?.commentaires && (
                <div className={styles.commentSection}>
                  <div className={styles.commentLabel}>Commentaires</div>
                  <div className={styles.commentText}>
                    {selectedDecision.seance.comites[0].decisionCDs[0].commentaires}
                  </div>
                </div>
              )}

              {/* Additional Permis Information */}
              {selectedDecision.permis && selectedDecision.permis.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>Informations du Titre Minier</h3>
                  <div className={styles.infoGrid}>
                    {selectedDecision.permis.map((permis: any) => (
                      <div key={permis.id_permis} className={styles.infoCard}>
                        <div className={styles.infoLabel}>Titre #{permis.num_permis}</div>
                        <div className={styles.infoValue}>
                          Statut: {permis.statut_permis}
                        </div>
                        {permis.titulaires && permis.titulaires.length > 0 && (
                          <div className={styles.infoValue}>
                            Titulaire: {permis.titulaires[0].nom_sociétéFR}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}