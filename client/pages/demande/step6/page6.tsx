'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiMapPin,
  FiEdit2,
  FiRefreshCw,
  FiChevronLeft,
  FiSave,
  FiDownload,
  FiUpload,
  FiChevronRight
} from 'react-icons/fi';
import * as turf from '@turf/turf';
import styles from './cadastre.module.css';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { useSearchParams } from 'next/navigation';
import { BsSave } from 'react-icons/bs';
import { useViewNavigator } from '../../../src/hooks/useViewNavigator';
import ProgressStepper from '../../../components/ProgressStepper';
import { STEP_LABELS } from '../../../src/constants/steps';
import { useActivateEtape } from '@/hooks/useActivateEtape';

export default function CadastrePage() {
  const ArcGISMap = dynamic(() => import('../../../components/map/ArcGISMap'), {
    ssr: false,
    loading: () => <div className="map-loading">Chargement de la carte...</div>
  });

  type Point = {
    id: string;
    x: string;
    y: string;
    z: string;
  };

  type PermitData = {
    code: string;
    type: string;
    holder: string;
    wilaya: string;
    daira: string;
    commune: string;
  };

  // State for points and polygon
  const router = useRouter();
  const [idDemande, setIdDemande] = useState<number | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [superficie, setSuperficie] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState('coordinates');
  const [comment, setComment] = useState('');
  const [overlapDetected, setOverlapDetected] = useState(false);
  const [overlapPermits, setOverlapPermits] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [error, setError] = useState<string | null>(null);
  const [savingEtape, setSavingEtape] = useState(false);
  const [etapeMessage, setEtapeMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { auth, isLoaded, hasPermission } = useAuthStore();
  const isCadastre = auth.role === 'cadastre';
  const [isPolygonValid, setIsPolygonValid] = useState(true);
  const hasUniqueCoords = new Set(points.map(p => `${p.x},${p.y}`)).size === points.length;
  const [demandeSummary, setDemandeSummary] = useState<any>(null);
  const { currentView, navigateTo } = useViewNavigator();
  const currentStep = 5;
  const [isLoading, setIsLoading] = useState(false);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const [permitData, setPermitData] = useState<PermitData>({
    code: '',
    type: '',
    holder: '',
    wilaya: '',
    daira: '',
    commune: ''
  });
  const mapRef = useRef<any>(null);
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);


    useActivateEtape({ idProc, etapeNum: 6, statutProc });
  /*useEffect(() => {
    if (!idProc || from === 'suivi') return;
    const activateStep = async () => {
      try {
        await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/6`);
      } catch (err) {
        console.error("Échec de l'activation de l'étape");
      }
    };

    activateStep();
  }, [idProc, from]);*/



  useEffect(() => {
    if (!idDemande) return;

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${apiURL}/api/demande/${idDemande}/summary`);
        setDemandeSummary(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch summary", error);
      }
    };

    fetchSummary();
  }, [idDemande]);
  useEffect(() => {
    if (demandeSummary) {
      console.log('🟢 Full demande summary:', demandeSummary);
      setPermitData({
        code: demandeSummary.code_demande || '',
        type: demandeSummary.typePermis?.lib_type || '',
        holder: demandeSummary.detenteur?.nom_sociétéFR || '',
        wilaya: demandeSummary.wilaya?.nom_wilaya || '',
        daira: demandeSummary.daira?.nom_daira || '',
        commune: demandeSummary.commune?.nom_commune || ''
      });
    }
  }, [demandeSummary]);

  // Generate unique ID for points
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add a new point
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

  const [existingPolygons, setExistingPolygons] = useState<{idProc:number; num_proc:string ;id_demande: number; code_demande: string; coordinates: [number, number][] }[]>([]);
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await axios.get(`${apiURL}/coordinates/existing`);
        setExistingPolygons(res.data);
        console.log("existingPolygons passed to map:", existingPolygons);
      } catch (err) {
        console.error('❌ Failed to fetch existing polygons', err);
      }
    };
    fetchExisting();
  }, []);

  useEffect(() => {
  if (!idProc) return;

  const fetchCoordinates = async () => {
    try {
      const res = await axios.get(`${apiURL}/coordinates/procedure/${idProc}`);
      const points = res.data;

      setPoints(
        points.map((c: any) => ({
  id: generateId(),
  x: c.coordonnee?.x?.toString() ?? '0',
  y: c.coordonnee?.y?.toString() ?? '0',
  z: c.coordonnee?.z?.toString() ?? '',
}))

      );
    } catch (err) {
      console.error('❌ Failed to load coordinates:', err);
    }
  };

  fetchCoordinates();
}, [idProc]);


  const saveCoordinatesToBackend = async () => {
  if (!points || points.length < 3) {
    setError("Le polygone doit contenir au moins 3 points.");
    setTimeout(() => setError(null), 4000);
    return;
  }

  const url = `${apiURL}/coordinates/update`;

  try {
    await axios.post(url, {
      id_proc: idProc,
      id_zone_interdite: null,
      points,
      superficie,
    });

    setSuccess("✅ Coordonnées sauvegardées avec succès !");
    setTimeout(() => setSuccess(null), 4000);
  } catch (err) {
    console.error("❌ Erreur lors de la sauvegarde des coordonnées:", err);
    setError("❌ Échec de la sauvegarde des coordonnées.");
    setTimeout(() => setError(null), 4000);
  }
};




  useEffect(() => {
    if (!router.isReady) return; // wait for router to be ready
    const id_proc = router.query.id as string;
    if (!id_proc) return;

    const fetchDemande = async () => {
      try {
        const res = await axios.get(`${apiURL}/api/procedures/${id_proc}/demande`);
        setIdDemande(res.data.id_demande);
        setStatutProc(res.data.procedure.statut_proc);
        console.log('🎯 Loaded id_demande:', res.data.id_demande);
      } catch (error) {
        console.error('❌ Failed to fetch demande:', error);
      }
    };

    fetchDemande();
  }, [router.isReady, router.query.id]);

  const handleSaveEtape = async () => {
    if (!idProc) {
      setError("ID procédure manquant !");
      return;
    }

    setSavingEtape(true);
    setEtapeMessage(null); try {
      await axios.post(`${apiURL}/api/procedure-etape/finish/${idProc}/6`);
      setSuccess("Étape 6 enregistrée avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur étape", err);
      setError("Erreur lors de l'enregistrement de l'étape");
    } finally {
      setSavingEtape(false);
    }
  };

  // nsupprimiw les points
  const removePoint = (id: string) => {
    if (points.length <= 3) return; // Need at least 3 points for a polygon
    setPoints(points.filter(p => p.id !== id));
  };

  // ndiro update lel points
  const handleChange = (id: string, key: string, value: string) => {
    setPoints(points.map(p =>
      p.id === id ? { ...p, [key]: value } : p
    ));
  };

  // na7asbo lmisa7a ta3 lpolygone avec Turf.js
  const calculateArea = useCallback(() => {
  // Filter out invalid points
  const validPoints = points.filter(p =>
    p.x && p.y && !isNaN(parseFloat(p.x)) && !isNaN(parseFloat(p.y))
  );

  // Minimum 3 points required for a polygon
  if (validPoints.length < 3) {
    setSuperficie(0);
    setIsPolygonValid(false);
    return 0;
  }

  try {
    // Convert to coordinate array
    let coordinates = validPoints.map(p => [parseFloat(p.x), parseFloat(p.y)]);
    
    // Remove consecutive duplicate points
    coordinates = coordinates.filter((coord, index) => 
      index === 0 || 
      !(coord[0] === coordinates[index-1][0] && coord[1] === coordinates[index-1][1])
    );

    // Check if we still have enough points after cleaning
    if (coordinates.length < 3) {
      setIsPolygonValid(false);
      setSuperficie(0);
      return 0;
    }

    // Ensure polygon is closed (first and last points equal)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates.push([...first]);
    }

    // Create the polygon
    const polygon = turf.polygon([coordinates]);

    // Basic validation
    if (!turf.booleanValid(polygon)) {
      console.warn('Invalid polygon geometry');
      setIsPolygonValid(false);
      setSuperficie(0);
      return 0;
    }

    // Advanced validation - check for self-intersections
    const isSimple = isPolygonSimple(coordinates);
    if (!isSimple) {
      console.warn('Polygon has self-intersections');
      setIsPolygonValid(false);
      setSuperficie(0);
      return 0;
    }

    // Calculate area if all validations pass
    setIsPolygonValid(true);
    const area = turf.area(polygon);
    const areaHectares = area / 10000;
    setSuperficie(parseFloat(areaHectares.toFixed(2)));
    return areaHectares;
  } catch (err) {
    console.error('Area calculation error:', err);
    setIsPolygonValid(false);
    setSuperficie(0);
    return 0;
  }
}, [points]);

// Helper function to detect self-intersections
function isPolygonSimple(coordinates: number[][]) {
  // Implementation of the Bentley-Ottmann algorithm for detecting line segment intersections
  const segments = [];
  
  // Create line segments from coordinates
  for (let i = 0; i < coordinates.length - 1; i++) {
    segments.push({
      p1: coordinates[i],
      p2: coordinates[i+1]
    });
  }

  // Check all pairs of non-adjacent segments for intersections
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 2; j < segments.length; j++) {
      // Skip checking the last segment with the first segment
      if (i === 0 && j === segments.length - 1) continue;
      
      if (doSegmentsIntersect(segments[i], segments[j])) {
        return false;
      }
    }
  }
  
  return true;
}

// Helper function to check if two line segments intersect
function doSegmentsIntersect(s1: {p1: number[], p2: number[]}, s2: {p1: number[], p2: number[]}) {
  const [x1, y1] = s1.p1;
  const [x2, y2] = s1.p2;
  const [x3, y3] = s2.p1;
  const [x4, y4] = s2.p2;

  // Calculate orientation values
  const orient1 = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);
  const orient2 = (y2 - y1) * (x4 - x2) - (x2 - x1) * (y4 - y2);
  const orient3 = (y4 - y3) * (x1 - x4) - (x4 - x3) * (y1 - y4);
  const orient4 = (y4 - y3) * (x2 - x4) - (x4 - x3) * (y2 - y4);

  // General case of line segments intersecting
  if ((orient1 * orient2 < 0) && (orient3 * orient4 < 0)) {
    return true;
  }

  // Special cases (colinear points, etc.)
  if (orient1 === 0 && isPointOnSegment(s1, s2.p1)) return true;
  if (orient2 === 0 && isPointOnSegment(s1, s2.p2)) return true;
  if (orient3 === 0 && isPointOnSegment(s2, s1.p1)) return true;
  if (orient4 === 0 && isPointOnSegment(s2, s1.p2)) return true;

  return false;
}

// Helper function to check if a point lies on a segment
function isPointOnSegment(seg: {p1: number[], p2: number[]}, point: number[]) {
  const [x, y] = point;
  const [x1, y1] = seg.p1;
  const [x2, y2] = seg.p2;
  
  // Check if point is within the bounding box of the segment
  if (x <= Math.max(x1, x2) && x >= Math.min(x1, x2) &&
      y <= Math.max(y1, y2) && y >= Math.min(y1, y2)) {
    // Check if point is colinear with segment
    const area = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
    return Math.abs(area) < 1e-9; // Account for floating point precision
  }
  return false;
}


  // Check for overlaps with other permits (mock implementation)
  const checkForOverlaps = useCallback(() => {
  const validPoints = points.filter(
    p =>
      p.x &&
      p.y &&
      !isNaN(parseFloat(p.x)) &&
      !isNaN(parseFloat(p.y))
  );

  if (validPoints.length < 3) return;

  const coordinates = validPoints.map(p => [
    parseFloat(p.x),
    parseFloat(p.y)
  ]);

  // Ensure first and last are the same
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push([...first]);
  }

  const newPoly = turf.polygon([coordinates]);
  const overlappingSites: string[] = [];

  for (const { idProc, num_proc, coordinates: existingCoords } of existingPolygons) {
  if (idProc === idDemande) continue;

  try {
  const existingPoly = turf.polygon([existingCoords]);
  const isSame = turf.booleanEqual(newPoly, existingPoly);
  if (isSame) continue;

  const overlap =
    turf.booleanOverlap(newPoly, existingPoly) ||
    turf.booleanIntersects(newPoly, existingPoly);

  if (overlap) {
    overlappingSites.push(num_proc);
  }
} catch (e) {
  console.warn('Invalid polygon skipped:', existingCoords, e);
}

}


  setOverlapDetected(overlappingSites.length > 0);
  setOverlapPermits(overlappingSites);
}, [points, existingPolygons, idDemande]);




  // Handle map click when in drawing mode
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isDrawing) {
      addPoint({ lat, lng });
    }
  }, [isDrawing, addPoint]);

  // Recalculate when points change
  useEffect(() => {
    calculateArea();
    checkForOverlaps();
  }, [points, calculateArea, checkForOverlaps]);

  // Validate polygon
  const polygonValid = points.length >= 4 && hasUniqueCoords;
  const allFilled = points.every(p => p.x && p.y && p.z);

  // Export polygon data
  const exportData = () => {
    const data = {
      points,
      superficie,
      permitData,
      createdAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perimeter-${permitData.code}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // Import polygon data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.points && Array.isArray(data.points)) {
          setPoints(data.points);
          if (data.superficie) setSuperficie(data.superficie);
          if (data.permitData) setPermitData(data.permitData);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    router.push(`/demande/step7/page7?id=${idProc}`);
  };
  const handleBack = () => {
    if (!idProc) {
      setError("ID procédure manquant");
      return;
    }
    router.push(`/demande/step5/page5?id=${idProc}`);
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
            <span>Cadastre</span>
          </div>
          <div className={styles['content-wrapper']}>

            {/* Progress Steps */}
            <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />


            <div className={styles['cadastre-app']}>
              <header className={styles['app-header']}>
                <h1>Définir le périmètre du permis minier</h1>
                <p className={styles['subtitle']}>Délimitation géographique et vérification des empiètements territoriaux</p>
              </header>

              <div className={styles['app-layout']}>
                {/* Left Panel - Map */}
                <section className={styles['map-container']}>
                  <div className={styles['map-header']}>
                    <h2>
                      <FiMapPin /> Carte interactive
                      <span className={styles['badge']}>{points.length} points</span>
                    </h2>
                    <div className={styles['map-controls']}>
                      <button
                        className={`${styles['map-btn']} ${isDrawing ? styles['active'] : ''}`}
                        onClick={() => isCadastre && setIsDrawing(!isDrawing)}
                        disabled={!isCadastre || statutProc === 'TERMINEE' || !statutProc}
                      >
                        <FiEdit2 /> {isDrawing ? 'Mode dessin actif' : 'Dessiner un polygone'}
                      </button>

                      <button className={styles['map-btn']} onClick={calculateArea} disabled={!isCadastre || statutProc === 'TERMINEE' || !statutProc}>
                        <FiRefreshCw /> Calculer superficie
                      </button>
                    </div>
                  </div>

                  <ArcGISMap
                    ref={mapRef}
                    points={points}
                    superficie={superficie}
                    isDrawing={isDrawing}
                    onMapClick={handleMapClick}
                    onPolygonChange={(polygon) => {
                      if (polygon && polygon.length >= 3) {
                        setPoints(polygon.map(coord => ({
                          id: generateId(),
                          x: coord[0].toString(),
                          y: coord[1].toString(),
                          z: '0'
                        })));
                      }
                    }}
                    
                    existingPolygons={Object.fromEntries(
                      
  existingPolygons.map((p, index) => [p.num_proc || `unknown-${index}`, p.coordinates])
)}


                  />

                  <div className={styles['map-footer']}>
                    <div className={styles['area-display']}>
                      <span>Superficie calculée:</span>
                      <strong>{superficie.toLocaleString()} ha</strong>
                    </div>
                    <div className={styles['map-export']}>
                      <button className={styles['export-btn']} onClick={exportData} disabled={statutProc === 'TERMINEE' || !statutProc}>
                        <FiDownload /> Exporter
                      </button>
                      <label className={styles['import-btn']}>
                        <FiUpload /> Importer
                        <input type="file" accept=".json" onChange={importData} hidden disabled={!isCadastre} />
                      </label>
                    </div>
                  </div>
                </section>

                {/* Right Panel - Data */}
                <section className={styles['data-panel']}>
                  <div className={styles['panel-tabs']}>
                    <button
                      className={`${styles['tab-btn']} ${activeTab === 'coordinates' ? styles['active'] : ''}`}
                      onClick={() => setActiveTab('coordinates')}
                      disabled={statutProc === 'TERMINEE' || !statutProc}
                    >
                      Coordonnées
                    </button>
                    <button
                      className={`${styles['tab-btn']} ${activeTab === 'validation' ? styles['active'] : ''}`}
                      onClick={() => setActiveTab('validation')}
                    >
                      Validation
                    </button>
                    <button
                      className={`${styles['tab-btn']} ${activeTab === 'summary' ? styles['active'] : ''}`}
                      onClick={() => setActiveTab('summary')}
                    >
                      Résumé
                    </button>
                  </div>

                  <div className={styles['panel-content']}>
                    {activeTab === 'coordinates' && (
                      <>
                        <div className={styles['table-header']}>
                          <h3>Points du périmètre</h3>
                          {isCadastre && (
                            <button className={styles['add-btn']} onClick={() => addPoint()} disabled={statutProc === 'TERMINEE' || !statutProc}>
                              <FiPlus /> Ajouter
                            </button>
                          )}
                        </div>

                        <div className={styles['coordinates-table']}>
                          <div className={`${styles['table-row']} ${styles['header']}`}>
                            <div>#</div>
                            <div>Longitude (X)</div>
                            <div>Latitude (Y)</div>
                            <div>Altitude (Z)</div>
                            <div>Actions</div>
                          </div>

                          {points.map((point, index) => (
                            <div className={styles['table-row']} key={point.id}>
                              <div>{index + 1}</div>
                              <div>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={point.x}
                                  onChange={(e) => handleChange(point.id, 'x', e.target.value)}
                                  placeholder="0.000000"
                                  disabled={!isCadastre}
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={point.y}
                                  onChange={(e) => handleChange(point.id, 'y', e.target.value)}
                                  placeholder="0.000000"
                                  disabled={!isCadastre}
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={point.z}
                                  onChange={(e) => handleChange(point.id, 'z', e.target.value)}
                                  placeholder="0"
                                  disabled={!isCadastre}
                                />
                              </div>
                              <div>
                                <button
                                  className={styles['delete-btn']}
                                  onClick={() => removePoint(point.id)}
                                  disabled={points.length <= 3 || !isCadastre || statutProc === 'TERMINEE' || !statutProc}
                                  title={!isCadastre ? "Non autorisé" : points.length <= 3 ? "Un polygone doit avoir au moins 3 points" : "Supprimer ce point"}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activeTab === 'validation' && (
                      <div className={styles['validation-section']}>
                        <div className={`${styles['validation-card']} ${overlapDetected ? styles['error'] : styles['success']}`}>
                          <div className={styles['card-header']}>
                            {overlapDetected ? <FiAlertTriangle /> : <FiCheckCircle />}
                            <h3>Vérification des empiètements</h3>
                          </div>
                          {overlapDetected ? (
                            <>
                              <p>Empiètements détectés avec les permis suivants :</p>
                              <ul>
                                {overlapPermits.map((permit, idx) => (
                                  <li key={idx}>{permit}</li>
                                ))}
                              </ul>

                              <textarea
                                placeholder="Ajouter une remarque sur cet empiètement..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!isCadastre}
                              />
                            </>
                          ) : (
                            <p>Aucun empiètement détecté</p>
                          )}
                        </div>

                        <div className={`${styles['validation-card']} ${!polygonValid || !allFilled || !isPolygonValid ? styles['warning'] : styles['success']}`}>
                          <div className={styles['card-header']}>
                            {!polygonValid || !allFilled || !isPolygonValid ? <FiAlertTriangle /> : <FiCheckCircle />}
                            <h3>Validation du polygone</h3>
                          </div>
                          {!polygonValid && <p>• Au moins 4 points requis pour former un polygone</p>}
                          {!allFilled && <p>• Toutes les coordonnées doivent être renseignées</p>}
                          {!isPolygonValid && <p>• Le polygone est géométriquement invalide</p>}
                          {polygonValid && allFilled && isPolygonValid && <p>Le polygone est valide</p>}
                        </div>
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div className={styles['summary-section']}>
                        <div className={styles['summary-card']}>
                          <h3>Informations administratives</h3>
                          <div className={styles['info-grid']}>
                            <div>
                              <label>Code permis</label>
                              <input
                                value={permitData.code}
                                onChange={(e) => setPermitData({ ...permitData, code: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                            <div>
                              <label>Type permis</label>
                              <input
                                value={permitData.type}
                                onChange={(e) => setPermitData({ ...permitData, type: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                            <div>
                              <label>Titulaire</label>
                              <input
                                value={permitData.holder}
                                onChange={(e) => setPermitData({ ...permitData, holder: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                            <div>
                              <label>Wilaya</label>
                              <input
                                value={permitData.wilaya}
                                onChange={(e) => setPermitData({ ...permitData, wilaya: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                            <div>
                              <label>Daira</label>
                              <input
                                value={permitData.daira}
                                onChange={(e) => setPermitData({ ...permitData, daira: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                            <div>
                              <label>Commune</label>
                              <input
                                value={permitData.commune}
                                onChange={(e) => setPermitData({ ...permitData, commune: e.target.value })}
                                disabled={!isCadastre}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles['summary-card']}>
                          <h3>Caractéristiques techniques</h3>
                          <div className={styles['info-grid']}>
                            <div>
                              <label>Nombre de points</label>
                              <p>{points.length}</p>
                            </div>
                            <div>
                              <label>Superficie</label>
                              <p>{superficie.toLocaleString()} ha</p>
                            </div>
                            <div>
                              <label>Statut validation</label>
                              <p className={polygonValid && allFilled ? styles['valid'] : styles['invalid']}>
                                {polygonValid && allFilled ? 'Valide' : 'Non valide'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles['panel-actions']}>
                    <button className={styles['secondary-btn']} disabled={!isCadastre || statutProc === 'TERMINEE' || !statutProc}>
                      <FiChevronLeft /> Retour
                    </button>

                    <div className={styles['action-group']}>
                      <button className={styles['secondary-btn']} disabled={!isCadastre || statutProc === 'TERMINEE' || !statutProc}>
                        Enregistrer brouillon
                      </button>

                      <button
                        className={styles['primary-btn']}
                        disabled={!polygonValid || !allFilled || !isCadastre || statutProc === 'TERMINEE' || !statutProc}
                        onClick={saveCoordinatesToBackend}
                      >
                        <FiSave /> Valider le périmètre
                      </button>
                    </div>
                  </div>
                </section>
              </div>
              {/* Navigation buttons at top */}
              {auth.role !== 'cadastre' && (
                <><div className={`${styles['navigation-buttons']} ${styles['top-buttons']}`}>
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
                  </div></>
              )}

            </div>
          </div>
          {success && (
            <div className={`${styles.toast} ${styles.toastSuccess}`}>
              <FiCheckCircle className={styles.toastIcon} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className={`${styles.toast} ${styles.toastError}`}>
              <FiAlertTriangle className={styles.toastIcon} />
              <span>{error}</span>
            </div>
          )}
        </main>
      </div>
    </div>

  );

}