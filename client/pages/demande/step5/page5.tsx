'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  FiChevronLeft, FiChevronRight, FiMapPin, FiFileText, FiX,
  FiMap, FiGlobe, FiHash, FiEdit2, FiSearch,
  FiSave
} from 'react-icons/fi';
import styles from './substances.module.css';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import * as turf from '@turf/turf';
import { BsSave } from 'react-icons/bs';
import ConfirmReplaceModal from './ConfirmReplaceModal';
import SummaryModal from "../popup/page6_popup";
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import { toast } from 'react-toastify';
import { useActivateEtape } from '@/src/hooks/useActivateEtape';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

type Substance = {
  id_sub: number;
  nom_subFR: string;
  catégorie_sub: string;
};

type Point = {
  id: string;
  x: string;
  y: string;
  z: string;
};


type Wilaya = {
  id_wilaya: number;
  id_antenne: number;
  code_wilaya: string;
  nom_wilaya: string;
};

type Daira = {
  id_daira: number;
  id_wilaya: number;
  code_daira: string;
  nom_daira: string;
};

type Commune = {
  id_commune: number;
  id_daira: number;
  code_commune: string;
  nom_commune: string;
};

export default function Step4_Substances() {
  const searchParams = useSearchParams();
  const router = useRouterWithLoading();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [idDemande, setIdDemande] = useState<number | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 4;
  // Site Information State
  const [points, setPoints] = useState<Point[]>([]);
  const [polygonArea, setPolygonArea] = useState<number | null>(null);
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [daira, setDaira] = useState('');
  const [lieuDitFr, setLieuDitFr] = useState('');
  const [statutJuridique, setStatutJuridique] = useState('');
  const [occupantLegal, setOccupantLegal] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [travaux, setTravaux] = useState('');
  const [dureeTravaux, setDureeTravaux] = useState('');
  const [dateDebutPrevue, setDateDebutPrevue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Substances State
  const [allSubstances, setAllSubstances] = useState<Substance[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [famille, setFamille] = useState('');
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [superficiermax, setsuperficier] = useState(0);

  // Administrative divisions state
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [selectedDaira, setSelectedDaira] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  
  const [showModal, setShowModal] = useState(false);
  const [existingCoords, setExistingCoords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useActivateEtape({ idProc, etapeNum: 5, statutProc });

  useEffect(() => {
    if (!idProc) return;

    const fetchDemandeData = async () => {
      try {
        // First load wilayas
        const wilayasRes = await axios.get(`${apiURL}/api/wilayas`);
        setWilayas(wilayasRes.data);

        // Then load the demande data
        const res = await axios.get(`${apiURL}/api/procedures/${idProc}/demande`);
        const demande = res.data;
        setIdDemande(demande.id_demande);
        setCodeDemande(demande.code_demande);
        setStatutProc(res.data.procedure.statut_proc);
        setsuperficier(demande.typePermis.superficie_max)
        if (demande.coordonnees) setPoints(demande.coordonnees);
        console.log("sssssssssssssssssss",demande)
        // Set initial values
        const wilayaId = demande.id_wilaya?.toString() || '';
        const dairaId = demande.id_daira?.toString() || '';
        const communeId = demande.id_commune?.toString() || '';

        // Set display values first
        setWilaya(demande.wilaya?.nom_wilaya || '');
        setDaira(demande.daira?.nom_daira || '');
        setCommune(demande.commune?.nom_commune || '');
        if (wilayaId) {
          setSelectedWilaya(wilayaId);
          const dairasRes = await axios.get(`${apiURL}/api/wilayas/${wilayaId}/dairas`);
          setDairas(dairasRes.data);

          if (dairaId && dairasRes.data.some((d: { id_daira: { toString: () => any; }; }) => d.id_daira.toString() === dairaId)) {
            setSelectedDaira(dairaId);
            const communesRes = await axios.get(`${apiURL}/api/dairas/${dairaId}/communes`);
            setCommunes(communesRes.data);
            if (communeId && communesRes.data.some((c: { id_commune: { toString: () => any; }; }) => c.id_commune.toString() === communeId)) {
              setSelectedCommune(communeId);
            }
          }
        }

        setLieuDitFr(demande.lieu_dit || '');
        setStatutJuridique(demande.statut_juridique_terrain || '');
        setOccupantLegal(demande.occupant_terrain_legal || '');
        setSuperficie(demande.superficie?.toString() || '');
        setTravaux(demande.description_travaux || '');
        setDureeTravaux(demande.duree_travaux_estimee?.toString() || '');

      } catch (err) {
        console.error('Error loading demande', err);
        setError("Failed to load demande data");
      }
    };

    fetchDemandeData();
  }, [idProc]);

  useEffect(() => {
  if (!idProc) return;

  const fetchCoordinates = async () => {
  try {
    const res = await axios.get(`${apiURL}/coordinates/procedure/${idProc}`);
    const coords = res.data;

    const safeCoords = (coords ?? []).filter((c: any, i: number) => {
      const point = c?.coordonnee;
      const isValid = typeof point?.x !== 'undefined' && typeof point?.y !== 'undefined';
      if (!isValid) {
        console.warn(`⚠️ Invalid coordinate at index ${i}:`, c);
      }
      return isValid;
    });

    setPoints(
      safeCoords.map((c: any) => ({
        x: c.coordonnee.x?.toString() ?? '0',
        y: c.coordonnee.y?.toString() ?? '0',
        z: c.coordonnee.z?.toString() ?? '',
      }))
    );
  } catch (err) {
    console.error('❌ Failed to load coordinates:', err);
  }
};



  fetchCoordinates();
}, [idProc]);



  // Fetch all wilayas on component mount
  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const res = await axios.get(`${apiURL}/api/wilayas`);
        setWilayas(res.data);
      } catch (err) {
        console.error('Error loading wilayas', err);
      }
    };
    fetchWilayas();
  }, []);

  // Fetch dairas when wilaya is selected
  useEffect(() => {
    if (!selectedWilaya) {
      setDairas([]);
      setSelectedDaira('');
      return;
    }

    const fetchDairas = async () => {
      try {
        const res = await axios.get(`${apiURL}/api/wilayas/${selectedWilaya}/dairas`);
        setDairas(res.data);
      } catch (err) {
        console.error('Error loading dairas', err);
      }
    };

    fetchDairas();
  }, [selectedWilaya]);

  // Fetch communes when daira is selected
  useEffect(() => {
    if (!selectedDaira) {
      setCommunes([]);
      setSelectedCommune('');
      return;
    }

    const fetchCommunes = async () => {
      try {
        const res = await axios.get(`${apiURL}/api/dairas/${selectedDaira}/communes`);
        setCommunes(res.data);
      } catch (err) {
        console.error('Error loading communes', err);
      }
    };

    fetchCommunes();
  }, [selectedDaira]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const submitCoordinates = async (statutCoord: 'DEMANDE_INITIALE' = 'DEMANDE_INITIALE') => {
  setIsSaving(true);

  const payload = {
    id_proc: idProc,
    id_zone_interdite: null,
    points: points.map((p) => ({
      x: parseFloat(p.x),
      y: parseFloat(p.y),
      z: parseFloat(p.z),
    })),
    statut_coord: statutCoord,
  };

  try {
    const res = await fetch(`${apiURL}/coordinates/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Erreur lors de la mise à jour');

    const result = await res.json();
    toast.success('✅ Coordonnées enregistrées avec succès');
  } catch (err) {
    console.error(err);
    toast.error('❌ Erreur lors de l’enregistrement des coordonnées');
  } finally {
    setIsSaving(false);
    setShowModal(false);
  }
};


const saveCoordinatesToBackend = async () => {
  if (!idProc) {
    toast.error('ID de procédure introuvable');
    return;
  }

  // 🔥 Check superficie max before saving
  if (polygonArea !== null && polygonArea / 10000 > superficiermax) {
    toast.warning(
      `⚠️ La superficie calculée (${(polygonArea / 10000).toFixed(
        2
      )} Ha) dépasse la limite autorisée (${superficiermax} Ha)`
    );
    return;
  }

  const newPoints = points.map((p) => ({
    x: parseFloat(p.x),
    y: parseFloat(p.y),
    z: parseFloat(p.z),
  }));

  try {
    const existingRes = await fetch(`${apiURL}/coordinates/procedure/${idProc}`);
    if (!existingRes.ok)
      throw new Error('Erreur lors de la récupération des coordonnées existantes');

    const existing = await existingRes.json();

    const existingPoints = existing.map((pc: any) => ({
      x: parseFloat(pc.coordonnee.x),
      y: parseFloat(pc.coordonnee.y),
      z: parseFloat(pc.coordonnee.z),
    }));

    setExistingCoords(existingPoints);

    const areEqual =
      newPoints.length === existingPoints.length &&
      newPoints.every((np, index) => {
        const ep = existingPoints[index];
        return (
          Math.abs(np.x - ep.x) < 0.00001 &&
          Math.abs(np.y - ep.y) < 0.00001 &&
          Math.abs(np.z - ep.z) < 0.00001
        );
      });

    if (areEqual) {
      toast.info('✅ Coordonnées identiques déjà enregistrées');
      return;
    }

    if (existingPoints.length > 0) {
      setShowModal(true);
    } else {
      await submitCoordinates();
    }
  } catch (error) {
    console.error(error);
    toast.error('Erreur de vérification des coordonnées existantes');
  }
};






  // Substances functions
  const fetchSubstances = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiURL}/api/substances`, {
        params: { famille },
      });
      setAllSubstances(res.data);
    } catch (err) {
      console.error('Error loading substances', err);
      setError('Error loading substances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!idDemande) return;

    axios.get(`${apiURL}/api/substances/demande/${idDemande}`)
      .then(res => {
        setSelectedIds(res.data.map((item: any) => item.id_sub));
      })
      .catch(err => {
        console.warn('Error loading selected substances', err);
      });
  }, [idDemande]);

  useEffect(() => {
    if (idDemande) fetchSubstances();
  }, [idDemande, famille]);

  const handleSelect = async (sub: Substance) => {
    if (!idDemande) return;

    setIsLoading(true);
    const isSelected = selectedIds.includes(sub.id_sub);

    try {
      if (isSelected) {
        await axios.delete(
          `${apiURL}/api/substances/demande/${idDemande}/${sub.id_sub}`
        );
        setSelectedIds((prev) => prev.filter((id) => id !== sub.id_sub));
      } else {
        await axios.post(`${apiURL}/api/substances/demande/${idDemande}`, {
          id_substance: sub.id_sub,
        });
        setSelectedIds((prev) => [...prev, sub.id_sub]);
      }
    } catch (err) {
      console.error("Error updating selection", err);
      setError("Error updating selection");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (points.length >= 3 && points.every(coord => coord.x && coord.y)) {
      try {
        const polygon = turf.polygon([[
          ...points.map(coord => [
            parseFloat(coord.x),
            parseFloat(coord.y)
          ]),
          // Close the polygon by repeating the first point
          [
            parseFloat(points[0].x),
            parseFloat(points[0].y)
          ]
        ]]);

        const area = turf.area(polygon); // Area in square meters
        setPolygonArea(area);
        setSuperficie((area / 10000).toFixed(2)); // Convert to hectares
      } catch (err) {
        console.error("Error calculating polygon area:", err);
        setPolygonArea(null);
      }
    } else {
      setPolygonArea(null);
    }
  }, [points]);

  const isChecked = (id: number) => selectedIds.includes(id);
  // Coordinates functions
  const addPoint = useCallback((coords?: { lat: number, lng: number }) => {
      const newPoint = {
        id: generateId(),
        x: coords ? coords.lng.toString() : '',
        y: coords ? coords.lat.toString() : '',
        z: '0'
      };
      setPoints(prev => [...prev, newPoint]);
      return newPoint;
    }, []);

  const removeCoordinateRow = (index: number) => {
    const newCoords = [...points];
    newCoords.splice(index, 1);
    setPoints(newCoords);
  };

  const handleCoordinateChange = (index: number, field: keyof Point, value: string) => {
    const newCoords = [...points];
    newCoords[index][field] = value;
    setPoints(newCoords);
  };

  const handleSaveEtape = async () => {
    if (!idProc) {
      setEtapeMessage("ID procedure introuvable !");
      return;
    }

    setSavingEtape(true);
    setEtapeMessage(null);

    try {
    await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/5`);
      setEtapeMessage("Étape 5 enregistrée avec succès !");
    } catch (err) {
      console.error(err);
      setEtapeMessage("Erreur lors de l'enregistrement de l'étape.");
    } finally {
      setSavingEtape(false);
    }
  };

  const handleNext = async () => {
     if (!idProc) {
      setError("Procedure ID missing");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Get the selected administrative division names
      const selectedWilayaObj = wilayas.find(w => w.id_wilaya.toString() === selectedWilaya);
      const selectedDairaObj = dairas.find(d => d.id_daira.toString() === selectedDaira);
      const selectedCommuneObj = communes.find(c => c.id_commune.toString() === selectedCommune);

      // Prepare the data to save
      const demandeData = {
        // Administrative location data
        id_wilaya: selectedWilayaObj ? selectedWilayaObj.id_wilaya : null,
        id_daira: selectedDairaObj ? selectedDairaObj.id_daira : null,
        id_commune: selectedCommuneObj ? selectedCommuneObj.id_commune : null,
        lieu_dit: lieuDitFr, 
        superficie: parseFloat(superficie) || null,

        // Legal status data
        statut_juridique_terrain: statutJuridique,
        occupant_terrain_legal: occupantLegal,

        // Work information
        description_travaux: travaux,
        duree_travaux_estimee: parseInt(dureeTravaux) || null,

      };

      // Save the demande information
      await axios.put(`${apiURL}/demandes/${idDemande}`, demandeData);

      // Then mark the step as completed
      await axios.post(`${apiURL}/api/procedure-etape/set/${idProc}/5`);
      const res = await axios.get(`${apiURL}/api/demande/${idDemande}/summary`);
      setSummaryData(res.data);
      setShowModal(true);
      setSuccess("Data saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Erreur lors de la récupération du résumé", err);
      setError("Erreur lors de la récupération du résumé");
      setError("Error saving step");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleBack = () => {
  if (!idProc) {
    setError("ID procédure manquant");
    return;
  }
       router.push(`/demande/step4/page4?id=${idProc}`);

};

  if (!idProc) {
    return (
      <div className="error-message">
        <FiX className="error-icon" />
        <p>Missing `id` parameter in URL.</p>
      </div>
    );
  }




  return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Substances & Coordonnées</span>
          </div>

          <div className={styles['informations-container']}>
            {/* Progress UI */}
                        <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />


            {/* Header Section */}
            <div className={styles['header-section']}>
              <h1 className={styles['page-title']}>
                <FiMapPin className={styles['title-icon']} />
                Étape 4: Substances & Coordonnées
              </h1>
              <p className={styles['page-subtitle']}>
                Veuillez fournir les informations sur les substances et les Coordonnées prévus
              </p>
            </div>

            {/* Main Form - Two Columns */}
            <div className={styles['form-grid']}>
              {/* Left Column - Site Information */}
              <div className={styles['form-column']}>
                {/* Coordinates Card */}
                <div className={styles['form-card']}>
                  <div className={styles['form-card-header']}>
                    <FiMap className={styles['card-icon']} />
                    <h3>Coordonnées GPS</h3>
                  </div>
                  <div className={styles['form-card-body']}>
                    <div className={styles['coordinates-table-container']}>
                      <table className={styles['coordinates-table']}>
                        <thead>
                          <tr>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Altitude (m)</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {points.map((coord, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className={styles['form-input']}
                                  placeholder="34.123456"
                                  value={coord.x}
                                  onChange={(e) => handleCoordinateChange(index, 'x', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className={styles['form-input']}
                                  placeholder="2.987654"
                                  value={coord.y}
                                  onChange={(e) => handleCoordinateChange(index, 'y', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                disabled={statutProc === 'TERMINEE'}
                                  type="text"
                                  className={styles['form-input']}
                                  placeholder="500"
                                  value={coord.z}
                                  onChange={(e) => handleCoordinateChange(index, 'z', e.target.value)}
                                />
                              </td>
                              <td>
                                {points.length > 1 && (
                                  <button
                                  disabled={statutProc === 'TERMINEE' || !statutProc}
                                    className={styles['btn-remove-row']}
                                    onClick={() => removeCoordinateRow(index)}
                                  >
                                    <FiX />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Add/Save Buttons */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <button
                        disabled={ !statutProc}
                          className={styles['btn-add-row']}
                          onClick={() => addPoint()}
                        >
                          <FiEdit2 className={styles['btn-icon']} />
                          Ajouter un point
                        </button>

                        <>
     <button
  className={`${styles['btn-save']} ${
    isSaving ||
    !statutProc ||
    (polygonArea !== null && polygonArea / 10000 > superficiermax)
      ? styles['btn-disabled']
      : ''
  }`}
  onClick={saveCoordinatesToBackend}
  disabled={
    isSaving ||
    !statutProc ||
    (polygonArea !== null && polygonArea / 10000 > superficiermax)
  }
>
  {isSaving ? (
    <>
      <span className={styles['spinner']} /> Enregistrement...
    </>
  ) : (
    <>
      Enregistrer les coordonnées <FiSave className={styles['btn-icon']} />
    </>
  )}
</button>


      {showModal && (
  <ConfirmReplaceModal
    coordinates={existingCoords}
    onCancel={() => setShowModal(false)}
    onConfirm={() => submitCoordinates()} // <-- wrap it!
  />
)}

    </>
                      </div>
                    </div>

                    {/* Polygon Area Display */}
                    {polygonArea && superficiermax && (
  <div className={styles['polygon-info']}>
    <div className={styles['info-row']}>
      <span className={styles['info-label']}>Superficie calculée :&nbsp;</span>
      <span
        className={`${styles['info-value']} ${
          polygonArea / 10000 > superficiermax
            ? styles['error-text']
            : styles['success-text']
        }`}
      >
        {(polygonArea / 10000).toFixed(2)} Ha
      </span>
    </div>

    <div className={styles['info-row']}>
      <span className={styles['info-label']}>Superficie maximale autorisée :&nbsp;</span>
      <span className={styles['info-value']}>
        {superficiermax} Ha
      </span>
    </div>

    {polygonArea / 10000 > superficiermax && (
      <div className={styles['warning-box']}>
        ⚠️ La superficie calculée dépasse la limite maximale autorisée pour ce type de permis.
      </div>
    )}
  </div>
)}

                  </div>
                </div>
              {/* Location Information Card */}
              <div className={styles['form-card']}>
                <div className={styles['form-card-header']}>
                  <FiGlobe className={styles['card-icon']} />
                  <h3>Localisation Administrative</h3>
                </div>
                <div className={styles['form-card-body']}>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiMapPin className={styles['input-icon']} />
                      Wilaya
                    </label>
                    <select
                    disabled={statutProc === 'TERMINEE'}
                      className={styles['form-select']}
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                    >
                      <option value="">Sélectionner une wilaya</option>
                      {wilayas.map((w) => (
                        <option key={w.id_wilaya} value={w.id_wilaya}>
                          {w.code_wilaya} - {w.nom_wilaya}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiMapPin className={styles['input-icon']} />
                      Daïra
                    </label>
                    <select
                      className={styles['form-select']}
                      value={selectedDaira}
                      onChange={(e) => setSelectedDaira(e.target.value)}
                      disabled={!selectedWilaya || statutProc === 'TERMINEE'}
                    >
                      <option value="">Sélectionner une daïra</option>
                      {dairas.map((d) => (
                        <option key={d.id_daira} value={d.id_daira}>
                          {d.code_daira} - {d.nom_daira}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiMapPin className={styles['input-icon']} />
                      Commune
                    </label>
                    <select
                      className={styles['form-select']}
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      disabled={!selectedDaira || statutProc === 'TERMINEE'}
                    >
                      <option value="">Sélectionner une commune</option>
                      {communes.map((c) => (
                        <option key={c.id_commune} value={c.id_commune}>
                          {c.code_commune} - {c.nom_commune}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Legal Status Card */}
              <div className={styles['form-card']}>
                <div className={styles['form-card-header']}>
                  <FiFileText className={styles['card-icon']} />
                  <h3>Statut Juridique du Terrain</h3>
                </div>
                <div className={styles['form-card-body']}>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiFileText className={styles['input-icon']} />
                      Statut Juridique
                    </label>
                    <select
                    disabled={statutProc === 'TERMINEE'}
                      className={styles['form-select']}
                      value={statutJuridique}
                      onChange={(e) => setStatutJuridique(e.target.value)}
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="Domaine public">Domaine public</option>
                      <option value="Domaine privé de l'état">Domaine privé de l'état</option>
                      <option value="Propriété privée">Propriété privée</option>
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiFileText className={styles['input-icon']} />
                      Occupant Légal
                    </label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      className={styles['form-input']}
                      value={occupantLegal}
                      onChange={(e) => setOccupantLegal(e.target.value)}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiFileText className={styles['input-icon']} />
                      Lieu Dit
                    </label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="text"
                      className={styles['form-input']}
                      value={lieuDitFr}
                      onChange={(e) => setLieuDitFr(e.target.value)}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                      <FiHash className={styles['input-icon']} />
                      Superficie (Ha)
                    </label>
                    <input
                    disabled={statutProc === 'TERMINEE'}
                      type="number"
                      className={styles['form-input']}
                      value={superficie}
                      onChange={(e) => setSuperficie(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              </div>

            {/* Right Column - Substances Selection */}
            <div className={styles['form-column']}>
              {/* Substances Filter Card */}
              <div className={styles['form-card']}>
                <div className={styles['form-card-header']}>
                  <FiFileText className={styles['card-icon']} />
                  <h3>Substances Minérales</h3>
                </div>
                <div className={styles['form-card-body']}>
                  <div className={styles['filter-section']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Filtrer par famille</label>
                      <select
                      disabled={statutProc === 'TERMINEE'}
                        className={styles['form-select']}
                        onChange={(e) => setFamille(e.target.value)}
                        value={famille}
                      >
                        <option value="">Toutes les familles</option>
                        <option value="métalliques">Métalliques</option>
                        <option value="non-métalliques">Non métalliques</option>
                        <option value="radioactives">Radioactives</option>
                      </select>
                    </div>

                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Rechercher une substance</label>
                      <div className={styles['search-container']}>
                        <FiSearch className={styles['search-icon']} />
                        <input
                        disabled={statutProc === 'TERMINEE'}
                          type="text"
                          placeholder="Rechercher..."
                          className={styles['search-input']}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles['substances-list-container']}>
                    <h4 className={styles['list-title']}>
                      Substances disponibles
                      <span className={styles['list-count']}>{allSubstances.length}</span>
                    </h4>
                    <ul className={styles['substances-list']}>
                      {allSubstances
                        .filter((s) => s.nom_subFR.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((sub) => (
                          <li key={sub.id_sub} className={styles['substance-item']}>
                            <label className={styles['substance-label']}>
                              <input
                              disabled={statutProc === 'TERMINEE'}
                                type="checkbox"
                                className={styles['substance-checkbox']}
                                checked={isChecked(sub.id_sub)}
                                onChange={() => handleSelect(sub)}
                              />
                              <span className={styles['custom-checkbox']}></span>
                              <span className={styles['substance-name']}>{sub.nom_subFR}</span>
                              <span className={styles['substance-category']}>{sub.catégorie_sub}</span>
                            </label>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selected Substances Card */}
              <div className={styles['form-card']}>
                <div className={styles['form-card-header']}>
                  <FiFileText className={styles['card-icon']} />
                  <h3>Substances Sélectionnées</h3>
                </div>
                <div className={styles['form-card-body']}>
                  <h4 className={styles['list-title']}>
                    Substances choisies
                    <span className={styles['list-count']}>{selectedIds.length}</span>
                  </h4>

                  <ul className={styles['selected-substances-list']}>
                    {allSubstances
                      .filter((s) => selectedIds.includes(s.id_sub))
                      .map((sub) => (
                        <li key={sub.id_sub} className={styles['selected-substance']}>
                          <div className={styles['substance-info']}>
                            <span className={styles['substance-name']}>{sub.nom_subFR}</span>
                            <span className={styles['substance-category']}>{sub.catégorie_sub}</span>
                          </div>
                          <button
                          disabled={statutProc === 'TERMINEE' || !statutProc}
                            className={styles['remove-btn']}
                            onClick={() => handleSelect(sub)}
                          >
                            <FiX />
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
</div>

           
            </div>
             {/* Navigation Buttons */}
            <div className={styles['navigation-buttons']}>
              <button className={`${styles['btn']} ${styles['btn-outline']}`} onClick={handleBack}>
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
            <div className={styles['etapeSaveSection']}>
              {etapeMessage && (
                <div className={styles['etapeMessage']}>
                  {etapeMessage}
                </div>
              )}
            </div>
            {showModal && summaryData && (
                          <SummaryModal
                            data={summaryData}
                            onClose={() => setShowModal(false)}
                          />
                        )}
          </div>
        </main >
      </div >
    </div >

  );
}