import { useEffect, useState } from "react";

import axios from "axios";
import { FiSend, FiClock, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiDownload, FiFileText } from "react-icons/fi";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import styles from  "./avis_wali.module.css";
import Navbar from "../../../features/navbar/Navbar";
import Sidebar from "../../../features/sidebar/Sidebar";
import { BsFilePerson, BsSave } from "react-icons/bs";
import { useViewNavigator } from "../../../src/hooks/useViewNavigator";
import ProgressStepper from "../../../components/ProgressStepper";
import { STEP_LABELS } from "../../../src/constants/steps";
import { useActivateEtape } from "@/src/hooks/useActivateEtape";
import { useRouterWithLoading } from "@/src/hooks/useRouterWithLoading";

type InteractionWali = {
  id_interaction: number;
  id_procedure: number;
  type_interaction: "envoi" | "reponse";
  date_interaction: string;
  avis_wali?: "favorable" | "defavorable";
  remarques?: string;
  contenu?: string;
};

export default function AvisWaliStep() {
  const router = useRouterWithLoading();
  const searchParams = useSearchParams();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [idProcedure, setIdProcedure] = useState<number | null>(null);
  const [form, setForm] = useState({
    type_interaction: "reponse",
    date_interaction: new Date().toISOString(),
    avis_wali: "favorable",
    contenu: "",
  });
  const [interactions, setInteractions] = useState<InteractionWali[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { currentView, navigateTo } = useViewNavigator();
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const currentStep = 6;
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 7, statutProc });

  /*useEffect(() => {
    if (!idProc || from === 'suivi') return;
    const activateStep = async () => {
      try {
        await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/7`);
      } catch (err) {
        console.error("Échec de l'activation de l'étape");
      }
    };

    activateStep();
  }, [idProc, from]);*/

      

      const rejectDemande = async () => {
    if (!rejectionReason) {
      setError("Veuillez spécifier un motif de rejet");
      return;
    }

    try {
      await axios.put(
        `${apiURL}/api/demande/${idDemande}/status`,
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

   useEffect(() => {
    if (!idProc) return;

    axios.get(`${apiURL}/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande.toString());
        setCodeDemande(res.data.code_demande);
        setStatutProc(res.data.procedure.statut_proc);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);

   const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/7`);
    setEtapeMessage("Étape 7 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

  const generateWaliLetter = async (preview = false) => {
  setIsGeneratingPdf(true);
  try {
    const response = await axios.get(`${apiURL}/api/demande/${idDemande}/summary`);
    const demande = response.data;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Metadata
    doc.setProperties({
      title: `Lettre pour Wali - ${demande.code_demande}`,
      subject: "Demande d'avis pour permis minier",
      author: "Ministère de l'Énergie et des Mines"
    });

    // Header
    doc.addImage("/logo.jpg", "PNG", 15, 10, 30, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Ministère de l'Énergie et des Mines", 50, 15);
    doc.text("Direction Générale des Mines", 50, 20);
    doc.text("Alger, Algérie", 50, 25);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    // Ref Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Référence: ${demande.code_demande}`, 15, 45);
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, 160, 45);

    // Recipient
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("À Monsieur le Wali de la Wilaya de:", 15, 60);
    doc.setFont("helvetica", "normal");
    const wilaya = demande.detenteur?.RegistreCommerce?.[0]?.adresse_legale?.split(',')[1]?.trim() || 'Alger';
    doc.text(wilaya, 80, 60);

    // Objet
    doc.setFont("helvetica", "bold");
    doc.text("Objet:", 15, 75);
    doc.setFont("helvetica", "normal");
    doc.text("Demande d'avis concernant le permis minier", 30, 75);

    let y = 90;
    const marginLeft = 25;
    const lineHeight = 7;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const paragraph = `Monsieur le Wali,
Par la présente, nous avons l'honneur de vous soumettre la demande de permis minier déposée par la société ${demande.detenteur?.nom_sociétéFR || ''}, conformément aux dispositions réglementaires en vigueur.`;
    const lines = doc.splitTextToSize(paragraph, 165);
    doc.text(lines, marginLeft, y);
    y += lines.length * lineHeight + 5;

    // Company Info
doc.setFont("helvetica", "bold");
doc.text("Identification de l'entreprise:", marginLeft, y);
y += lineHeight;

const labelX = 25;
const valueX = 75;

const companyFields = [
  { label: "Raison sociale", value: demande.detenteur?.nom_sociétéFR },
  { label: "Registre de Commerce", value: demande.detenteur?.RegistreCommerce?.[0]?.numero_rc },
  { label: "NIF", value: demande.detenteur?.RegistreCommerce?.[0]?.nif },
  { label: "Adresse", value: demande.detenteur?.RegistreCommerce?.[0]?.adresse_legale },
  { label: "Téléphone", value: demande.detenteur?.telephone },
];

companyFields.forEach(({ label, value }) => {
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, labelX, y);
  doc.setFont("helvetica", "normal");

  const wrapped = doc.splitTextToSize(value || "Non spécifié", 110);
  doc.text(wrapped, valueX, y);
  y += wrapped.length * lineHeight;
});


   // Project Info
y += 5;
doc.setFont("helvetica", "bold");
doc.text("Détails du projet:", marginLeft, y);
y += lineHeight;

const substanceText = demande.procedure?.SubstanceAssocieeDemande
  ?.map((s: any) => s.substance.nom_subFR)
  .join(', ') || "Non spécifiées";

const projectFields = [
  { label: "Type de permis", value: demande.procedure?.typeProcedure?.nom },
  { label: "Domaine", value: demande.procedure?.typeProcedure?.domaine },
  { label: "Substances concernées", value: substanceText },
  { label: "Durée estimée", value: `${demande.duree_travaux_estimee} mois` },
  { label: "Budget prévisionnel", value: demande.budget_prevu ? `${demande.budget_prevu.toLocaleString('fr-FR')} DZD` : 'Non spécifié' }
];

projectFields.forEach(({ label, value }) => {
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, labelX, y);
  doc.setFont("helvetica", "normal");

  const wrapped = doc.splitTextToSize(value || "Non spécifié", 110);
  doc.text(wrapped, valueX, y);
  y += wrapped.length * lineHeight;
});


    // Documents
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Documents joints:", marginLeft, y);
    y += lineHeight;

    if (demande.DemandeDocumentStatut?.length > 0) {
      demande.DemandeDocumentStatut.forEach((docItem: any) => {
        const status = docItem.status === "present" ? "✔ Présent" : "✘ Manquant";
        const color: [number, number, number] = docItem.status === "present" ? [0, 128, 0] : [200, 0, 0];
        const label = `- ${docItem.document.nom_doc}`;
        doc.setFont("helvetica", "normal");
        doc.text(label, marginLeft, y);
        doc.setTextColor(...color);
        doc.text(status, marginLeft + 140, y);
        doc.setTextColor(0); // Reset
        y += lineHeight;
      });
    } else {
      doc.text("- Aucun document joint", marginLeft, y);
      y += lineHeight;
    }

    // Conclusion
    y += 10;
    const closing = "Dans l'attente de votre aimable retour, nous vous prions d'agréer, Monsieur le Wali, l'expression de notre haute considération.";
    const closingLines = doc.splitTextToSize(closing, 160);
    doc.text(closingLines, marginLeft, y);
    y += closingLines.length * lineHeight;

    // Signature
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Le Directeur Général des Mines", marginLeft + 80, y);
    doc.setFont("helvetica", "normal");
    doc.text("Ministère de l'Énergie et des Mines", marginLeft + 80, y + 7);

    if (preview) {
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setPdfPreviewVisible(true);
    } else {
      doc.save(`lettre_wali_${demande.code_demande}.pdf`);
    }

    setSuccess("Lettre générée avec succès");
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Erreur génération PDF :", err);
    setError("Erreur lors de la génération de la lettre");
  } finally {
    setIsGeneratingPdf(false);
  }
};


  const handleGenerateLetter = () => {
    generateWaliLetter(true); // Show preview first
  };

  const handleDownloadPdf = () => {
    generateWaliLetter(false); // Direct download
    setPdfPreviewVisible(false);
  };

  const fetchInteractions = async (procId: number) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiURL}/interactions-wali/${procId}`);
      setInteractions(res.data);
    } catch (error) {
      console.error("Erreur chargement interactions :", error);
      setError("Erreur lors du chargement des interactions");
    } finally {
      setIsLoading(false);
    }
  };
  const handleNext = () => {
    router.push(`/demande/step8/page8?id=${idProc}`);
  };
  const handleBack = () => {
    if (!idProc) {
      setError("ID procédure manquant");
      return;
    }
    router.push(`/demande/step6/page6?id=${idProc}`);
  };
  const handleSubmit = async () => {
    if (!form.contenu) {
      setError("Veuillez saisir le contenu de la réponse");
      return;
    }

    if (!idProcedure) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${apiURL}/interactions-wali`, {
        ...form,
        id_procedure: idProcedure,
      });
      await fetchInteractions(idProcedure);
      setForm((prev) => ({
        ...prev,
        contenu: "",
        date_interaction: new Date().toISOString(),
      }));
      setSuccess("Réponse enregistrée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur enregistrement :", err);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnvoiInitial = async () => {
    if (!idProcedure) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${apiURL}/interactions-wali`, {
        id_procedure: idProcedure,
        type_interaction: "envoi",
        date_interaction: new Date().toISOString(),
        remarques: "Envoi initial au wali",
      });
      await fetchInteractions(idProcedure);
      setSuccess("Demande envoyée au Wali");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur envoi initial :", err);
      setError("Erreur lors de l'envoi au Wali");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  if (idProc) {
    const parsedId = idProc;
    if (!isNaN(parsedId)) {
      fetchIdProcedure(parsedId);
    }
  }
}, [idProc]);



  const latestEnvoi = interactions
    .filter((i) => i.type_interaction === "envoi")
    .sort((a, b) => new Date(b.date_interaction).getTime() - new Date(a.date_interaction).getTime())[0];

  const daysLeft = latestEnvoi
    ? Math.max(0, 90 - Math.floor((Date.now() - new Date(latestEnvoi.date_interaction).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // In your fetchIdProcedure function, add this to get the demande data
  const fetchIdProcedure = async (idDemande: number | string | string[] | undefined) => {
  if (!idDemande) return;

  let parsedId: number | null = null;

  if (Array.isArray(idDemande)) {
    parsedId = parseInt(idDemande[0]); // take the first element
  } else {
    parsedId = typeof idDemande === 'string' ? parseInt(idDemande) : idDemande;
  }

  if (isNaN(parsedId)) {
    setError("Identifiant de demande invalide.");
    return;
  }

  setIsLoading(true);
  try {
    setIdProcedure(parsedId);
    await fetchInteractions(parsedId);
  } catch (error) {
    console.error("Erreur récupération procédure :", error);
    setError("Erreur lors du chargement de la procédure");
  } finally {
    setIsLoading(false);
  }
};


  // Modify your action-section to include the PDF button
  return (
    <div className={styles['app-container']}>
        <Navbar />
        <div className={styles['app-content']}>
            <Sidebar currentView={currentView} navigateTo={navigateTo} />
            <main className={styles['main-content']}>
                <div className={styles['breadcrumb']}>
                    <span>SIGAM</span>
                    <FiChevronRight className={styles['breadcrumb-arrow']} />
                    <span>Avis-Wali</span>
                </div>
                <div className={styles['avis-wali-container']}>
                    {/* Progress Steps */}
                              <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />


                    <div className={styles['content-wrapper']}>
                        <h2 className={styles['page-title']}>
                            <BsFilePerson />
                            Avis du Wali
                        </h2>
                        <div className={styles['demande-actions']}>
                    <div className={styles['reject-section']}>
                      <input
                      disabled={statutProc === 'TERMINEE'}
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Motif de rejet"
                        className={styles['reject-input']}
                      />
                      <button
                        className={styles['reject-btn']}
                        onClick={rejectDemande}
                        disabled={statutProc === 'TERMINEE' || !statutProc}
                      >
                        Rejeter la demande
                      </button>
                    </div>
                    
                  </div>
                        {isLoading && !idProcedure ? (
                            <div className={styles['loading-state']}>
                                <div className={styles['spinner']}></div>
                                <p>Chargement de la procédure...</p>
                            </div>
                        ) : error ? (
                            <div className={styles['error-message']}>
                                <FiX className={styles['error-icon']} />
                                <p>{error}</p>
                            </div>
                        ) : success ? (
                            <div className={styles['success-message']}>
                                <FiCheck className={styles['success-icon']} />
                                <p>{success}</p>
                            </div>
                        ) : null}

                        {idProcedure && (
                            <>
                                <div className={styles['action-section']}>
  <div className={styles['action-buttons']}>
    <div>
      <button 
        onClick={handleEnvoiInitial} 
        className={`${styles['btn']} ${styles['btn-primary']}`}
        disabled={isLoading || statutProc === 'TERMINEE' || !statutProc}
      >
        <FiSend className={styles['btn-icon']} />
        Marquer comme envoyé au Wali
      </button>
    </div>

    <div>
      <button 
        onClick={handleGenerateLetter} 
        className={`${styles['btn']} ${styles['btn-secondary']}`}
        disabled={isLoading || isGeneratingPdf || statutProc === 'TERMINEE' || !statutProc}
      >
        {isGeneratingPdf ? (
          <span className={styles['btn-loading']}>
            <span className={styles['spinner-small']}></span>
            Génération...
          </span>
        ) : (
          <>
            <FiDownload className={styles['btn-icon']} />
            Générer lettre Wali
          </>
        )}
      </button>
    </div>
  </div>

  {latestEnvoi && (
    <div className={`${styles['delay-box']} ${daysLeft === 0 ? styles['urgent'] : ''}`}>
      <div className={styles['delay-content']}>
        <FiClock className={styles['delay-icon']} />
        <div>
          <strong>Délai restant :</strong>
          <span className={styles['days-left']}>{daysLeft} jour{daysLeft === 1 ? "" : "s"}</span>
        </div>
      </div>
      {daysLeft === 0 && (
        <button 
          className={`${styles['btn']} ${styles['btn-warning']}`} 
          onClick={handleEnvoiInitial}
          disabled={isLoading || statutProc === 'TERMINEE' || !statutProc}
        >
          <FiSend className={styles['btn-icon']} />
          Relancer la demande
        </button>
      )}
    </div>
  )}
</div>


                                <div className={styles['response-section']}>
                                    <h3 className={styles['section-title']}>Réponse du Wali</h3>
                                    
                                    <div className={styles['form-group']}>
                                        <label className={styles['form-label']}>Avis</label>
                                        <div className={styles['radio-group']}>
                                            <label className={`${styles['radio-option']} ${form.avis_wali === 'favorable' ? styles['selected'] : ''}`}>
                                                <input
                                                disabled={statutProc === 'TERMINEE'}
                                                    type="radio"
                                                    name="avis_wali"
                                                    value="favorable"
                                                    checked={form.avis_wali === 'favorable'}
                                                    onChange={() => setForm({ ...form, avis_wali: 'favorable' })}
                                                />
                                                <span className={styles['radio-custom']}></span>
                                                Favorable
                                            </label>
                                            <label className={`${styles['radio-option']} ${form.avis_wali === 'defavorable' ? styles['selected'] : ''}`}>
                                                <input
                                                disabled={statutProc === 'TERMINEE'}
                                                    type="radio"
                                                    name="avis_wali"
                                                    value="defavorable"
                                                    checked={form.avis_wali === 'defavorable'}
                                                    onChange={() => setForm({ ...form, avis_wali: 'defavorable' })}
                                                />
                                                <span className={styles['radio-custom']}></span>
                                                Défavorable
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label className={styles['form-label']}>Contenu ou remarques</label>
                                        <textarea
                                        disabled={statutProc === 'TERMINEE'}
                                            className={styles['form-textarea']}
                                            placeholder="Saisissez les détails de la réponse du Wali..."
                                            value={form.contenu}
                                            onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                                            rows={5}
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSubmit} 
                                        className={`${styles['btn']} ${styles['btn-success']}`}
                                        disabled={isLoading || statutProc === 'TERMINEE' || !statutProc}
                                    >
                                        {isLoading ? (
                                            <span className={styles['btn-loading']}>
                                                <span className={styles['spinner-small']}></span>
                                                Enregistrement...
                                            </span>
                                        ) : (
                                            <>
                                                <FiCheck className={styles['btn-icon']} />
                                                Enregistrer la réponse
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className={styles['history-section']}>
                                    <h3 className={styles['section-title']}>Historique des interactions</h3>
                                    
                                    {interactions.length === 0 ? (
                                        <div className={styles['empty-state']}>
                                            <p>Aucune interaction enregistrée pour cette demande.</p>
                                        </div>
                                    ) : (
                                        <div className={styles['timeline']}>
                                            {interactions.map((interaction, idx) => (
                                                <div key={idx} className={styles['timeline-item']}>
                                                    <div className={`${styles['timeline-badge']} ${styles[interaction.type_interaction]}`}>
                                                        {interaction.type_interaction === 'envoi' ? <FiSend /> : <FiCheck />}
                                                    </div>
                                                    <div className={styles['timeline-content']}>
                                                        <div className={styles['timeline-header']}>
                                                            <span className={`${styles['interaction-type']} ${styles[interaction.type_interaction]}`}>
                                                                {interaction.type_interaction.toUpperCase()}
                                                            </span>
                                                            <span className={styles['interaction-date']}>
                                                                {new Date(interaction.date_interaction).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className={styles['interaction-details']}>
                                                            {interaction.avis_wali ? (
                                                                <span className={`${styles['avis-badge']} ${styles[interaction.avis_wali]}`}>
                                                                    Avis {interaction.avis_wali}
                                                                </span>
                                                            ) : null}
                                                            <p>{interaction.remarques || interaction.contenu || "Aucun détail fourni"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className={styles['navigation-buttons']}>
                            <button className={`${styles['btn']} ${styles['btn-outline']}`} onClick={handleBack} >
                                <FiChevronLeft className={styles['btn-icon']} />
                                Précédent
                            </button>
                            <button
                className={styles['btnSave']}
                onClick={handleSaveEtape}
                disabled={savingEtape || statutProc === 'TERMINEE' || !statutProc}
              >
                <BsSave className={styles['btnIcon']} /> {savingEtape ? "Sauvegarde en cours..." : "Sauvegarder l'étape"}
              </button>
                            <button 
                                className={`${styles['btn']} ${styles['btn-primary']}`} 
                                onClick={handleNext}
                                disabled={isLoading}
                            >
                                Suivant
                                <FiChevronRight className={styles['btn-icon']} />
                            </button>
                        </div>
                        <div className={styles['etapeSaveSection']}>
                {etapeMessage && (
                  <div className={styles['etapeMessage']}>
                    {etapeMessage}
                  </div>
                )}
              </div>
                        {pdfPreviewVisible && (
                            <div className={styles['pdf-preview-modal']}>
                                <div className={styles['pdf-preview-container']}>
                                    <div className={styles['pdf-preview-header']}>
                                        <FiFileText className={styles['pdf-icon']} />
                                        <h3>Aperçu de la Lettre Administrative</h3>
                                        <button 
                                            onClick={() => setPdfPreviewVisible(false)} 
                                            className={styles['close-button']}
                                            disabled={statutProc === 'TERMINEE' || !statutProc}
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                    <div className={styles['pdf-preview-content']}>
                                        <iframe 
                                            src={pdfUrl} 
                                            width="100%" 
                                            height="500px"
                                            style={{ border: 'none' }}
                                            title="Lettre Wali Preview"
                                        />
                                    </div>
                                    <div className={styles['pdf-preview-actions']}>
                                        <button 
                                            onClick={handleDownloadPdf}
                                            className={styles['download-button']}
                                            disabled={statutProc === 'TERMINEE' || !statutProc}
                                        >
                                            <FiDownload className={styles['button-icon']} />
                                            Télécharger le PDF
                                        </button>
                                        <button 
                                            onClick={() => setPdfPreviewVisible(false)} 
                                            className={styles['cancel-button']}
                                            disabled={statutProc === 'TERMINEE' || !statutProc}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    </div>
);
}