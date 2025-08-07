"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  FiUpload,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiAlertCircle
} from "react-icons/fi";
import styles from '@/features/demande/step2/documents.module.css';
import Navbar from "../../../features/navbar/Navbar";
import Sidebar from "../../../features/sidebar/Sidebar";
import { CgFileDocument } from "react-icons/cg";
import { BsSave } from "react-icons/bs";
import { useAuthStore } from "../../../src/store/useAuthStore";
import ProgressStepper from "../../../components/ProgressStepper";
import { STEP_LABELS } from "../../../src/constants/steps";
import { useViewNavigator } from "../../../src/hooks/useViewNavigator";
import { useActivateEtape } from "@/src/hooks/useActivateEtape";
import { useRouterWithLoading } from "@/src/hooks/useRouterWithLoading";

type Document = {
  id_doc: number;
  nom_doc: string;
  description: string;
  format: string;
  taille_doc: string;
  statut?: string;
  file_url?: string;
};

type DossierFournis = {
  id_dossierFournis: number;
  statut_dossier: string;
  remarques?: string;
  date_depot: string;
};

type DocStatus = "present" | "manquant" | "attente";
type DocumentWithStatus = Document & { statut: DocStatus };

export default function Step5_Documents() {
  const searchParams = useSearchParams();
  const router = useRouterWithLoading();
  const originalId  = searchParams?.get("originalDemandeId");
  const originalprocid  = searchParams?.get("original_proc_id");
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, DocStatus>>({});
  const [fileUrls, setFileUrls] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const [currentDossier, setCurrentDossier] = useState<DossierFournis | null>(null);
  const [remarques, setRemarques] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { auth, isLoaded, hasPermission } = useAuthStore();
  const [showCahierForm, setShowCahierForm] = useState(false);
  const [selectedCahierDoc, setSelectedCahierDoc] = useState<DocumentWithStatus | null>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 1;
  const [showOriginalDocs, setShowOriginalDocs] = useState(false);
  const [statutProc, setStatutProc] = useState<string | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

useEffect(() => {
  if (!idProc  || window.self !== window.top) return;
  const activateStep = async () => {
    try {
      const currentUrl = window.location.pathname + window.location.search;
      await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/2` , {
         link: currentUrl
      });
    } catch (err) {
      console.error("Échec de l'activation de l'étape");
    }
  };

  activateStep();
}, [idProc]);


useEffect(() => {
  const activateStep = async () => {
    if (!idProc) return;
    try {
      await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/2`);
    } catch (err) {
      console.error("Échec de l'activation de l'étape");
    }
  };

  activateStep();
}, [idProc]);

  const handleOpenCahierForm = (doc: DocumentWithStatus) => {
    setSelectedCahierDoc(doc);
    setShowCahierForm(true);
  };

  const CahierFormModal = () => (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h3>Remplir Cahier des Charges</h3>
          <button
            onClick={() => setShowCahierForm(false)}
            className={styles['modal-close']}
          >
            &times;
          </button>
        </div>
        <div className={styles['modal-body']}>
          <iframe
            src={`/demande/step11/page11?id=${idProc}`}
            className={styles['cahier-iframe']}
          />
        </div>
      </div>
    </div>
  );

  const OriginalDocsModal = () => (
  <div className={styles['modal-overlay']}>
    <div className={styles['modal-content']}>
      <div className={styles['modal-header']}>
        <h3>Documents de la demande originale</h3>
        <button
          onClick={() => setShowOriginalDocs(false)}
          className={styles['modal-close']}
        >
          &times;
        </button>
      </div>
      <div className={styles['modal-body']}>
        <iframe
          src={`http://localhost:3000/demande/step2/page2?id=${originalprocid}`}
          className={styles['cahier-iframe']}
        />
      </div>
    </div>
  </div>
);


  useEffect(() => {
    if (!idProc) return;

    axios.get(`${apiURL}/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande.toString());
        setCodeDemande(res.data.code_demande);
       /* setStatutProc(res.data.procedure.statut_proc);*/
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

  useEffect(() => {
    if (!idDemande) return;
    fetchDocuments();
  }, [idDemande]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiURL}/api/procedure/${idDemande}/documents`);

      setDocuments(res.data.documents);

      const initialStatus: Record<number, DocStatus> = {};
      const initialFileUrls: Record<number, string> = {};

      res.data.documents.forEach((doc: DocumentWithStatus) => {
        initialStatus[doc.id_doc] = doc.statut || 'attente';
        if (doc.file_url) {
          initialFileUrls[doc.id_doc] = doc.file_url;
        }
      });

      setStatusMap(initialStatus);
      setFileUrls(initialFileUrls);

      if (res.data.dossierFournis) {
        setCurrentDossier(res.data.dossierFournis);
        setRemarques(res.data.dossierFournis.remarques || "");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des documents", err);
      setError("Erreur lors du chargement des documents");
    } finally {
      setIsLoading(false);
    }
  };

  const submitDossier = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      documents: Object.entries(statusMap).map(([id, status]) => ({
        id_doc: Number(id),
        status,
        file_url: fileUrls[Number(id)] || null
      })),
      remarques
    };

    try {
      await axios.post(
        `${apiURL}/api/demande/${idDemande}/dossier-fournis`,
        payload
      );

      setSuccess("Dossier mis à jour avec succès");
      fetchDocuments();
      return true;
    } catch (err) {
      console.error("Erreur lors de la soumission du dossier", err);
      setError("Erreur lors de la soumission du dossier");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveDemande = async () => {
    try {
      await axios.put(
        `${apiURL}/api/demande/${idDemande}/status`,
        { statut_demande: 'ACCEPTEE' }
      );
      setSuccess("Demande approuvée avec succès");
    } catch (err) {
      console.error("Erreur lors de l'approbation", err);
      setError("Erreur lors de l'approbation");
    }
  };

  const rejectDemande = async () => {
    if (!rejectionReason) {
      setError("Veuillez spécifier un motif de rejet");
      return;
    }

    try {
      await axios.put(
        `${apiURL}/api/demande/${idDemande}/status`,
        {
          statut_demande: 'REJETEE',
          motif_rejet: rejectionReason
        }
      );
      setSuccess("Demande rejetée avec succès");
    } catch (err) {
      console.error("Erreur lors du rejet", err);
      setError("Erreur lors du rejet");
    }
  };

  const handleFileUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${apiURL}/api/demande/${idDemande}/document/${id}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setFileUrls(prev => ({ ...prev, [id]: res.data.fileUrl }));
      toggleStatus(id, "present");
      return res.data.fileUrl;
    } catch (err) {
      console.error("Erreur lors de l'upload du fichier", err);
      setError("Erreur lors de l'upload du fichier");
      return null;
    }
  };

  const toggleStatus = (id: number, status: DocStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: status }));
  };

  const countByStatus = (status: DocStatus) =>
    Object.values(statusMap).filter((s) => s === status).length;

  const total = documents.length;
  const presents = countByStatus("present");
  const manquants = countByStatus("manquant");
  const attente = countByStatus("attente");

  const handleNext = async () => {
    if (attente > 0) {
      setError("Tous les documents doivent être marqués 'présent' ou 'manquant'");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dossierSubmitted = await submitDossier();
      if (!dossierSubmitted) return;
      router.push(`/renouvellement/step3/page3?id=${idProc}&originalDemandeId=${originalId}&original_proc_id=${originalprocid}`);


    } catch (err) {
      console.error("Erreur lors de la récupération du résumé", err);
      setError("Erreur lors de submitted dossier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (!idProc) return;
    router.push(`/demande/step1/page1?id=${idProc}`);
  };


   const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  if (statutProc === 'TERMINEE') {
    setEtapeMessage("Procédure déjà terminée.");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/2`);

    setEtapeMessage("Étape 2 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

  return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Documents</span>
          </div>

          <div className={styles['documents-container']}>
            <div className={styles['content-wrapper']}>
              {/* Progress Steps */}
              <ProgressStepper
  steps={
    originalprocid
      ? STEP_LABELS.filter((step) => step !== "Avis Wali")
      : STEP_LABELS
  }
  currentStep={currentStep}
/>


              <h2 className={styles['page-title']}>
                <CgFileDocument className={styles['title-icon']} />
                Documents requis
              </h2>

              {error && (
                <div className={styles['error-message']}>
                  <FiAlertCircle className={styles['error-icon']} />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className={styles['success-message']}>
                  <FiCheck className={styles['success-icon']} />
                  <p>{success}</p>
                </div>
              )}

              {codeDemande && idDemande && (
                <div className={styles['info-card']}>
                  <div className={styles['info-header']}>
                    <h4 className={styles['info-title']}>
                      <FiFileText className={styles['info-icon']} />
                      Informations Demande
                    </h4>
                  </div>
                  <div className={styles['info-content']}>
                    <div className={styles['info-row']}>
                      <span className={styles['info-label']}>Code Demande :</span>
                      <span className={styles['info-value']}>{codeDemande}</span>
                    </div>
                    <div className={styles['info-row']}>
                      <span className={styles['info-label']}>ID Demande :</span>
                      <span className={styles['info-value']}>{idDemande}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentDossier && (
                <div className={styles['dossier-status-section']}>
                  <div className={styles['dossier-status']}>
                    <span>Statut du dossier: </span>
                    <strong className={
                      currentDossier.statut_dossier === 'complet'
                        ? styles['status-complete']
                        : styles['status-incomplete']
                    }>
                      {currentDossier.statut_dossier === 'complet' ? 'Complet' : 'Incomplet'}
                    </strong>
                  </div>

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
                    <button
                      className={styles['approve-btn']}
                      onClick={approveDemande}
                    >
                      demande Accepté
                    </button>
                   

                  </div>
                </div>
              )}

              {isLoading && documents.length === 0 ? (
                <div className={styles['loading-state']}>
                  <div className={styles['spinner']}></div>
                  <p>Chargement des documents...</p>
                </div>
              ) : (
                <>
                  <div className={styles['documents-overview']}>
                    {originalprocid && (
  <button
    className={styles['btn']}
    onClick={() => setShowOriginalDocs(true)}
  >
    Afficher les documents de la demande originale
  </button>
)}
                    <div className={styles['overview-card']}>
                      <h3 className={styles['overview-title']}>Documents requis</h3>
                       
                      <div className={styles['overview-value']}>{total}</div>
                    </div>
                  </div>

                  <div className={styles['documents-list']}>
                    {documents.map((doc) => {
                      const status = statusMap[doc.id_doc];
                      const fileUrl = fileUrls[doc.id_doc];

                      return (
                        <div key={doc.id_doc} className={`${styles['document-card']} ${styles[status]}`}>
                          <div className={styles['document-header']}>
                            <h4 className={styles['document-title']}>{doc.nom_doc}</h4>
                            <span className={styles['document-status']}>
                              {status === "present" ? "Présent" : status === "manquant" ? "Manquant" : "EN_ATTENTE"}
                            </span>
                          </div>
                          <div className={styles['document-details']}>
                            <div className={styles['document-description']}>{doc.description}</div>
                            <div className={styles['document-meta']}>
                              <span className={styles['document-format']}>{doc.format}</span>
                              <span className={styles['document-size']}>{doc.taille_doc}</span>
                            </div>
                            {fileUrl && (
                              <div className={styles['document-file']}>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles['file-link']}
                                >
                                  Voir le fichier joint
                                </a>
                              </div>
                            )}
                          </div>
                          <div className={styles['document-actions']}>
                            <button
                              className={`${styles['status-btn']} ${status === "present" ? styles['active'] : ""}`}
                              onClick={() => toggleStatus(doc.id_doc, "present")}
                            >
                              <FiCheck className={styles['btn-icon']} />
                              Présent
                            </button>
                            <button
                              className={`${styles['status-btn']} ${status === "manquant" ? styles['active'] : ""}`}
                              onClick={() => toggleStatus(doc.id_doc, "manquant")}
                            >
                              <FiX className={styles['btn-icon']} />
                              Manquant
                            </button>
                            <div className={styles['upload-section']}>
                              <label htmlFor={`file-upload-${doc.id_doc}`} className={styles['upload-btn']}>
                                <FiUpload className={styles['btn-icon']} />
                                {fileUrl ? "Modifier" : "Upload"}
                              </label>
                            </div>
                            {doc.nom_doc === "Cahier des charges renseigné" && (
                              <button
                                className={styles['cahier-btn']}
                                onClick={() => handleOpenCahierForm(doc)}
                              >
                                Remplir cahier de charge
                              </button>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles['progress-section']}>
                    <h3 className={styles['section-title']}>État d'avancement</h3>

                    <div className={styles['stats-grid']}>
                      <div className={styles['stat-card']}>
                        <div className={styles['stat-value']}>{total}</div>
                        <div className={styles['stat-label']}>Total</div>
                      </div>
                      <div className={`${styles['stat-card']} ${styles['present']}`}>
                        <div className={styles['stat-value']}>{presents}</div>
                        <div className={styles['stat-label']}>Présents</div>
                      </div>
                      <div className={`${styles['stat-card']} ${styles['missing']}`}>
                        <div className={styles['stat-value']}>{manquants}</div>
                        <div className={styles['stat-label']}>Manquants</div>
                      </div>

                    </div>

                    <div className={styles['completion-bar']}>
                      <div className={styles['completion-track']}>
                        <div
                          className={styles['completion-progress']}
                          style={{ width: `${((presents / total) * 100)}%` }}
                        ></div>
                      </div>
                      <div className={styles['completion-text']}>
                        {presents === total ? (
                          <span className={styles['complete']}>Tous les documents sont présents!</span>
                        ) : (
                          <span className={styles['incomplete']}>
                            {attente > 0 ? "Veuillez vérifier tous les documents" : "Documents en cours de vérification"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className={styles['navigation-buttons']}>
                

                <button
                  className={styles['btnSave']}
                  onClick={handleSaveEtape}
                  disabled={savingEtape || isSubmitting}
                >
                  <BsSave className={styles['btnIcon']} />
                  {savingEtape ? "Sauvegarde en cours..." : "Sauvegarder l'étape"}
                </button>

                <button
                  className={`${styles['btn']} ${styles['btn-primary']}`}
                  onClick={handleNext}
                  disabled={isLoading || attente > 0 || isSubmitting}
                >
                  {isLoading || isSubmitting ? (
                    <span className={styles['btn-loading']}>
                      <span className={styles['spinner-small']}></span>
                      {isSubmitting ? "Soumission..." : "Vérification..."}
                    </span>
                  ) : (
                    <>
                      Suivant
                      <FiChevronRight className={styles['btn-icon']} />
                    </>
                  )}
                </button>
              </div>

              {etapeMessage && (
                <div className={styles['etapeMessage']}>
                  {etapeMessage}
                </div>
              )}
            </div>
            {showCahierForm && <CahierFormModal />}
            {showOriginalDocs && <OriginalDocsModal />}

          </div>
        </main>
      </div>
    </div>
  );
}
