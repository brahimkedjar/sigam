'use client';

import { useState } from 'react';
import styles from './demande2.module.css';
import  InfosGenerales from './InfosGenerales';
import  RepresentantLegal  from './RepresentantLegal';
import Actionnaires from './Actionnaires';
import  DetailsRC from './DetailsRC';
import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiFileText, FiChevronRight, FiChevronLeft, FiEdit, FiLoader } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../../features/navbar/Navbar';
import Sidebar from '../../../features/sidebar/Sidebar';
import { BsSave } from 'react-icons/bs';
import TauxWarningModal from '../../../src/hooks/taux_warning';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import { useActivateEtape } from '@/src/hooks/useActivateEtape';

type AccordionItem = {
  id: string;
  title: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
};

type Actionnaire = {
  id?: number;
  nom: string;
  prenom: string;
  lieu_naissance: string;
  nationalite: string;
  qualification: string;
  numero_carte: string;
  taux_participation: string;
};

type SocieteData = {
  infos: {
    nom_fr: string;
    nom_ar: string;
    statut_id: string;
    tel: string;
    email: string;
    fax: string;
    adresse: string;
    nationalite: string;

  };
  repLegal: {
    nom: string;
    prenom: string;
    nom_ar: string;
    prenom_ar: string;
    tel: string;
    email: string;
    fax: string;
    qualite: string;
    nationalite: string;
    nin: string;
    taux_participation: string;
  };
  rcDetails: {
    numero_rc: string;
    date_enregistrement: string;
    capital_social: string;
    nis: string;
    adresse_legale: string;
    nif: string;
  };
  actionnaires: Actionnaire[];
};

const initialData: SocieteData = {
  infos: {
    nom_fr: '',
    nom_ar: '',
    statut_id: '',
    tel: '',
    email: '',
    fax: '',
    adresse: '',
    nationalite: ''
  },
  repLegal: {
    nom: '',
    prenom: '',
    nom_ar: '',
    prenom_ar: '',
    tel: '',
    email: '',
    fax: '',
    qualite: '',
    nationalite: '',
    nin: '',
    taux_participation: ''
  },
  rcDetails: {
    numero_rc: '',
    date_enregistrement: '',
    capital_social: '',
    nis: '',
    adresse_legale: '',
    nif: '',
  },
  actionnaires: []
};

export default function Step2() {
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [idDemande, setIdDemande] = useState<string | null>(null);
  const router = useRouter();
  const [detenteurId, setDetenteurId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [showTauxModal, setShowTauxModal] = useState(false);
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 3, statutProc });

  const [tauxSummary, setTauxSummary] = useState<{ total: number; rep: number; actionnaires: number }>({
  total: 0,
  rep: 0,
  actionnaires: 0,
});
const [toastMessage, setToastMessage] = useState<string | null>(null);
const [toastType, setToastType] = useState<'success' | 'error' | null>(null);
  const formatDate = (isoDate?: string) => {
  if (!isoDate) return '';
  return new Date(isoDate).toISOString().split('T')[0];
};
  const [disabledSections, setDisabledSections] = useState<Record<string, boolean>>({
    infos: false,
    repLegal: false,
    rcDetails: false,
    actionnaires: false,
  });

  const [isModifying, setIsModifying] = useState<Record<string, boolean>>({
    infos: false,
    repLegal: false,
    rcDetails: false,
    actionnaires: false,
  });
    const { currentView, navigateTo } = useViewNavigator();
    const currentStep = 2;  



const handleNext = () => {
  const tauxRep = parseFloat(formData.repLegal.taux_participation || '0');
  const tauxActionnaires = formData.actionnaires.reduce((acc, a) => acc + parseFloat(a.taux_participation || '0'), 0);
  const totalTaux = tauxRep + tauxActionnaires;

  if (totalTaux !== 100) {
    setTauxSummary({ total: totalTaux, rep: tauxRep, actionnaires: tauxActionnaires });
    setShowTauxModal(true);
    return;
  }

  if (idProc) {
    router.push(`/demande/step4/page4?id=${idProc}`);
  } else {
    alert("ID procédure manquant.");
  }
};



const handlePrevious = () => {
      router.push(`/demande/step2/page2?id=${idProc}`);
};

 // Update fetchDemandeFromProc to set disabled sections
  const fetchDemandeFromProc = async (id_proc: string) => {
    try {
      const res = await axios.get(`${apiURL}/api/procedures/${id_proc}/demande`);
      const demande = res.data;

      setCodeDemande(demande.code_demande);
      setIdDemande(demande.id_demande.toString());
      setStatutProc(res.data.procedure.statut_proc);
      if (demande.detenteur) {
        const fonctions = demande.detenteur.fonctions;
        const representant = fonctions.find((f: { type_fonction: string; }) => f.type_fonction === "Représentant légal");
        const actionnaires = fonctions.filter((f: { type_fonction: string; }) => f.type_fonction === "Actionnaire");

        setDetenteurId(demande.detenteur.id_detenteur);
        setFormData({
    infos: {
      nom_fr: demande.detenteur.nom_sociétéFR,
      nom_ar: demande.detenteur.nom_sociétéAR,
      statut_id: demande.detenteur.id_statutJuridique,
      tel: demande.detenteur.telephone,
      email: demande.detenteur.email,
      fax: demande.detenteur.fax,
      adresse: demande.detenteur.adresse_siège,
      nationalite: demande.detenteur.nationalité,
    },
    repLegal: representant ? {
      nom: representant.personne.nomFR,
      prenom: representant.personne.prenomFR,
      nom_ar: representant.personne.nomAR,
      prenom_ar: representant.personne.prenomAR,
      tel: representant.personne.telephone,
      email: representant.personne.email,
      fax: representant.personne.fax,
      qualite: representant.personne.qualification,
      nationalite: representant.personne.nationalité,
      nin: representant.personne.num_carte_identité,
      taux_participation: representant.taux_participation
    } : initialData.repLegal,
    rcDetails: {
  ...demande.detenteur.registreCommerce,
  date_enregistrement: formatDate(demande.detenteur.registreCommerce?.date_enregistrement)
}
,
    actionnaires: actionnaires.map((a: { personne: { nomFR: any; prenomFR: any; lieu_naissance: any; nationalité: any; qualification: any; num_carte_identité: any; }; taux_participation: { toString: () => any; }; }) => ({
      nom: a.personne.nomFR,
      prenom: a.personne.prenomFR,
      lieu_naissance: a.personne.lieu_naissance,
      nationalite: a.personne.nationalité,
      qualification: a.personne.qualification,
      numero_carte: a.personne.num_carte_identité,
      taux_participation: a.taux_participation.toString()
    }))
  });
 setDisabledSections({
          infos: true,
          repLegal: !!representant,
          rcDetails: !!demande.detenteur.registreCommerce,
          actionnaires: actionnaires.length > 0,
        });
      }

  } catch (err) {
    console.error("Erreur lors de la récupération de la demande par id_proc:", err);
  }
};



useEffect(() => {
  const id = searchParams?.get('id');
  if (id) {
    fetchDemandeFromProc(id);
  }
}, [searchParams]);

const accordions: AccordionItem[] = [
  { id: 'infos', title: "Informations générales de la société", color: 'blue' },
  { id: 'repLegal', title: "Représentant légal de la société", color: 'orange' },
  { id: 'rcDetails', title: "Détails du Registre de Commerce", color: 'green' },
  { id: 'actionnaires', title: "Actionnaires de la société", color: 'purple' },
];
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<SocieteData>(initialData);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
useEffect(() => {
  const id = searchParams?.get('id');
  if (id) {
    fetchDemandeFromProc(id);
  }
}, [searchParams]);

const handleSaveEtape = async () => {
  if (!idProc) {
    setEtapeMessage("ID procedure introuvable !");
    return;
  }

  setSavingEtape(true);
  setEtapeMessage(null);

  try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/3`);
    setEtapeMessage("Étape 3 enregistrée avec succès !");
  } catch (err) {
    console.error(err);
    setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
  } finally {
    setSavingEtape(false);
  }
};

const handleInfosChange = (data: SocieteData['infos']) => {
  setFormData(prev => ({ ...prev, infos: data }));
};

const handleRepLegalChange = (data: SocieteData['repLegal']) => {
  setFormData(prev => ({ ...prev, repLegal: data }));
};

const handleRcDetailsChange = (data: SocieteData['rcDetails']) => {
  setFormData(prev => ({ ...prev, rcDetails: data }));
};

const handleActionnairesChange = (data: SocieteData['actionnaires']) => {
  setFormData(prev => ({ ...prev, actionnaires: data }));
};


  const toggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleSaveSection = async (section: keyof SocieteData) => {
  setIsSaving(prev => ({ ...prev, [section]: true }));
  setToastMessage(null);
  
  try {
    let response;
    
    switch(section) {
      case 'infos':
        if (detenteurId) {
          response = await axios.put(`${apiURL}/api/detenteur-morale/${detenteurId}`, formData.infos);
        } else {
          response = await axios.post(`${apiURL}/api/detenteur-morale`, formData.infos);
          const newId = response.data?.id_detenteur;
          if (newId) {
            setDetenteurId(newId);
            if (idDemande) {
              await axios.put(`${apiURL}/api/demande/${idDemande}/link-detenteur`, {
                id_detenteur: newId
              });
            }
          }
        }
        break;

      case 'repLegal':
  if (!detenteurId) throw new Error("Détenteur non défini !");
  if (!formData.repLegal.nin) throw new Error("NIN du représentant légal est requis");

  try {
    // 🟡 Tenter de mettre à jour (cas où la personne existe)
    response = await axios.put(
      `${apiURL}/api/representant-legal/${formData.repLegal.nin}`,
      {
        ...formData.repLegal,
        id_detenteur: detenteurId
      }
    );
  } catch (err: any) {
    // 🔴 Si la personne n'existe pas (404), la créer
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      response = await axios.post(
        `${apiURL}/api/representant-legal`,
        {
          ...formData.repLegal,
          id_detenteur: detenteurId
        }
      );
    } else {
      throw err;
    }
  }
  break;


      case 'rcDetails':
  if (!detenteurId) throw new Error("Détenteur non défini !");
  
  try {
    // 🟡 Tenter de mettre à jour
    response = await axios.put(
      `${apiURL}/api/registre-commerce/${detenteurId}`,
      {
        ...formData.rcDetails,
        id_detenteur: detenteurId
      }
    );
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      // 🔴 S'il n'existe pas, créer le registre
      response = await axios.post(
        `${apiURL}/api/registre-commerce`,
        {
          ...formData.rcDetails,
          id_detenteur: detenteurId
        }
      );
    } else {
      throw err;
    }
  }
  break;

      case 'actionnaires':
        if (!detenteurId) throw new Error("Détenteur non défini !");
        response = await axios.put(
          `${apiURL}/api/actionnaires/${detenteurId}`,
          {
            actionnaires: formData.actionnaires,
            id_detenteur: detenteurId
          }
        );
        break;
    }
    
    setToastType('success');
    setToastMessage(`✅ Section "${section}" enregistrée avec succès.`);
    setDisabledSections(prev => ({ ...prev, [section]: true }));
    setIsModifying(prev => ({ ...prev, [section]: false }));
  } catch (error: any) {
    let message = 'Erreur inconnue';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message;
    }
    setToastType('error');
    setToastMessage(`❌ ${message}`);
  } finally {
    setIsSaving(prev => ({ ...prev, [section]: false }));
  }
};

  const handleModifySection = (section: keyof SocieteData) => {
    setDisabledSections(prev => ({ ...prev, [section]: false }));
    setIsModifying(prev => ({ ...prev, [section]: true }));
  };
// And in your delete action if needed:
const handleDeleteActionnaires = async () => {
  if (!detenteurId) return;
  
  try {
    await axios.delete(`${apiURL}/api/actionnaires/${detenteurId}`);
    setFormData(prev => ({ ...prev, actionnaires: [] }));
    setToastType('success');
    setToastMessage('Actionnaires supprimés avec succès');
  } catch (error) {
    setToastType('error');
    setToastMessage('Erreur lors de la suppression des actionnaires');
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
          <span>Identification</span>
        </div>

        <div className={styles.demandeContainer}>
                        <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />


          <div className={styles.contentWrapper}>
            <h2 className={styles.pageTitle}>
              <span className={styles.stepNumber}>Étape 2</span>
              Identification de la société
            </h2>
            <p className={styles.pageSubtitle}>
              Informations légales complètes de l'entité morale demandant le permis minier
            </p>

            {codeDemande && idDemande && (
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <h4 className={styles.infoTitle}>
                    <FiFileText className={styles.infoIcon} />
                    Informations Demande
                  </h4>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Code Demande :</span>
                    <span className={styles.infoValue}>{codeDemande}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ID Demande :</span>
                    <span className={styles.infoValue}>{idDemande}</span>
                  </div>
                </div>
              </div>
            )}

            <h2 className={styles.stepTitle}>Identification de la société</h2>
            <p className={styles.stepDescription}>
              Informations légales complètes de l'entité morale demandant le permis minier
            </p>

            {accordions.map(({ id, title, color }) => (
              <div
                className={`${styles.accordion} ${openSection === id ? styles.active : ''}`}
                key={id}
              >
                <div
                  className={`${styles.accordionHeader} ${styles[color]}`}
                  onClick={() => toggle(id)}
                >
                  <span>{title}</span>
                  <span className={styles.accordionIcon}>{openSection === id ? '▲' : '▼'}</span>
                </div>

                {openSection === id && (
  <div className={styles.accordionBody}>
    {id === 'infos' && (
      <>
        <InfosGenerales 
          data={formData.infos} 
          onChange={handleInfosChange}
          disabled={disabledSections.infos && !isModifying.infos}
        />
        <div className={styles.sectionButtons}>
          {(!disabledSections.infos || isModifying.infos) ? (
            <button
              className={styles.btnSave}
              onClick={() => handleSaveSection('infos')}
              disabled={isSaving.infos || statutProc === 'TERMINEE' || !statutProc}
            >
              {isSaving.infos ? (
                <>
                  <FiLoader className={styles.spinner} /> Sauvegarde...
                </>
              ) : (
                <>
                  <BsSave /> Sauvegarder
                </>
              )}
            </button>
          ) : (
            <button
              className={styles.btnModify}
              disabled={statutProc === 'TERMINEE' || !statutProc}
              onClick={() => handleModifySection('infos')}
            >
              <FiEdit /> Modifier
            </button>
          )}
        </div>
      </>
    )}

    {id === 'repLegal' && (
      <>
        <RepresentantLegal 
          data={formData.repLegal} 
          onChange={handleRepLegalChange}
          disabled={disabledSections.repLegal && !isModifying.repLegal}
        />
        <div className={styles.sectionButtons}>
          {(!disabledSections.repLegal || isModifying.repLegal) ? (
            <button
              className={styles.btnSave}
              onClick={() => handleSaveSection('repLegal')}
              disabled={isSaving.repLegal || statutProc === 'TERMINEE' || !statutProc}
            >
              {isSaving.repLegal ? (
                <>
                  <FiLoader className={styles.spinner} /> Sauvegarde...
                </>
              ) : (
                <>
                  <BsSave /> Sauvegarder
                </>
              )}
            </button>
          ) : (
            <button
              className={styles.btnModify}
              disabled={statutProc === 'TERMINEE' || !statutProc}
              onClick={() => handleModifySection('repLegal')}
            >
              <FiEdit /> Modifier
            </button>
          )}
        </div>
      </>
    )}

    {id === 'rcDetails' && (
      <>
        <DetailsRC 
          data={formData.rcDetails} 
          onChange={handleRcDetailsChange}
          disabled={disabledSections.rcDetails && !isModifying.rcDetails}
        />
        <div className={styles.sectionButtons}>
          {(!disabledSections.rcDetails || isModifying.rcDetails) ? (
            <button
              className={styles.btnSave}
              onClick={() => handleSaveSection('rcDetails')}
              disabled={isSaving.rcDetails || statutProc === 'TERMINEE' || !statutProc}
            >
              {isSaving.rcDetails ? (
                <>
                  <FiLoader className={styles.spinner} /> Sauvegarde...
                </>
              ) : (
                <>
                  <BsSave /> Sauvegarder
                </>
              )}
            </button>
          ) : (
            <button
              className={styles.btnModify}
              disabled={statutProc === 'TERMINEE' || !statutProc}
              onClick={() => handleModifySection('rcDetails')}
            >
              <FiEdit /> Modifier
            </button>
          )}
        </div>
      </>
    )}

    {id === 'actionnaires' && (
      <>
        <Actionnaires
          data={formData.actionnaires}
          onChange={handleActionnairesChange}
          disabled={disabledSections.actionnaires && !isModifying.actionnaires}
        />
        <div className={styles.sectionButtons}>
          {formData.actionnaires.length > 0 && (
  <>
    {(!disabledSections.actionnaires || isModifying.actionnaires) ? (
      <button
        className={styles.btnSave}
        onClick={() => handleSaveSection('actionnaires')}
        disabled={isSaving.actionnaires || statutProc === 'TERMINEE' || !statutProc}
      >
        {isSaving.actionnaires ? (
          <>
            <FiLoader className={styles.spinner} /> Sauvegarde...
          </>
        ) : (
          <>
            <BsSave /> Sauvegarder
          </>
        )}
      </button>
    ) : (
      <button
        className={styles.btnModify}
        disabled={statutProc === 'TERMINEE' || !statutProc}
        onClick={() => handleModifySection('actionnaires')}
      >
        <FiEdit /> Modifier
      </button>
    )}

    {/* ✅ Bouton Supprimer Actionnaires */}
    <button
      className={styles.btnDelete}
      disabled={statutProc === 'TERMINEE' || !statutProc}
      onClick={handleDeleteActionnaires}
      style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: '#fff' }}
    >
      <FiX /> Supprimer les actionnaires
    </button>
  </>
)}

        </div>
      </>
    )}
  </div>
)}
              </div>
            ))}

            

            <div className={styles.stepButtons}>
              <button className={styles.btnPrevious} onClick={handlePrevious}><FiChevronLeft className={styles.btnIcon} /> Précédente</button>
              
              <button
                className={styles.btnSave}
                onClick={handleSaveEtape}
                disabled={savingEtape || statutProc === 'TERMINEE' || !statutProc}
              >
                <BsSave className={styles.btnIcon} /> {savingEtape ? "Sauvegarde en cours..." : "Sauvegarder l'étape"}
              </button>
              <button className={styles.btnNext} onClick={handleNext}>Suivante <FiChevronRight className={styles.btnIcon} /></button>
            </div>
            <div className={styles.etapeSaveSection}>
              {etapeMessage && (
                <div className={styles.etapeMessage}>
                  {etapeMessage}
                </div>
              )}
            </div>
          </div>
        </div>
        {toastMessage && (
  <div className={`${styles.toast} ${toastType === 'success' ? styles.toastSuccess : styles.toastError}`}>
    {toastMessage}
    <button onClick={() => setToastMessage(null)} className={styles.toastClose}>×</button>
  </div>
)}
        {showTauxModal && (
  <TauxWarningModal
    total={tauxSummary.total}
    tauxRep={tauxSummary.rep}
    tauxActionnaires={tauxSummary.actionnaires}
    onClose={() => setShowTauxModal(false)}
  />
)}

      </main>
    </div>
  </div>
);
}