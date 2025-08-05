'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  FiUpload
} from 'react-icons/fi';
import * as turf from '@turf/turf';
import axios from 'axios';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';
import ArcGISMap from '@/components/map/ArcGISMap';
//import ArcGISMap from '@/components/map/DynamicArcGISMap'; // cleaner with `@` alias

export default function CadastrePage() {


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
  const router = useRouterWithLoading();
const [idDemande, setIdDemande] = useState<number | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [superficie, setSuperficie] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState('coordinates');
  const [comment, setComment] = useState('');
  const [overlapDetected, setOverlapDetected] = useState(false);
  const [overlapPermit, setOverlapPermit] = useState('');
  const [permitData, setPermitData] = useState<PermitData>({
    code: 'PXM-2025-014',
    type: 'Exploration de mines (PEM)',
    holder: 'SARL Atlas Mining',
    wilaya: 'Adrar',
    daira: 'Alger Centre',
    commune: 'Alger Centre'
  });
  const mapRef = useRef<any>(null);

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
useEffect(() => {
  if (!router.isReady) return; // wait for router to be ready
  const id_proc = router.query.id as string;
  if (!id_proc) return;

  const fetchDemande = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/procedures/${id_proc}/demande`);
      setIdDemande(res.data.id_demande);
    } catch (error) {
      console.error('❌ Failed to fetch demande:', error);
    }
  };

  fetchDemande();
}, [router.isReady, router.query.id]);



const saveCoordinatesToBackend = async () => {
    if (!idDemande) {
      console.error('❌ id_demande not loaded yet');
      return;
    }

    const payload = {
      id_demande: idDemande,
      id_zone_interdite: 1,
      points: points.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
      })),
    };


    try {
      const response = await fetch('http://localhost:3001/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
    } catch (error) {
      console.error('❌ Failed to save coordinates:', error);
    }
  };
  // Initialize with 3 points for a valid polygon
  useEffect(() => {
    if (points.length === 0) {
      setPoints([
        { id: generateId(), x: '3.058', y: '36.753', z: '0' },
        { id: generateId(), x: '3.068', y: '36.756', z: '0' },
        { id: generateId(), x: '3.062', y: '36.758', z: '0' }
      ]);
    }
  }, [points.length]);

  // Remove a point
  const removePoint = (id: string) => {
    if (points.length <= 3) return; // Need at least 3 points for a polygon
    setPoints(points.filter(p => p.id !== id));
  };

  // Update point coordinates
  const handleChange = (id: string, key: string, value: string) => {
    setPoints(points.map(p => 
      p.id === id ? { ...p, [key]: value } : p
    ));
  };

  // Calculate polygon area using Turf.js
  const calculateArea = useCallback(() => {
  const validPoints = points.filter(p => p.x && p.y && !isNaN(parseFloat(p.x)) && !isNaN(parseFloat(p.y)));

  if (validPoints.length < 3) {
    setSuperficie(0);
    return 0;
  }

  try {
    const coordinates = validPoints.map(p => [parseFloat(p.x), parseFloat(p.y)]);
    coordinates.push(coordinates[0]); // Close the polygon

    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    const areaHectares = area / 10000;

    setSuperficie(parseFloat(areaHectares.toFixed(2)));
    return areaHectares;
  } catch (err) {
    console.error('Area calculation error:', err);
    setSuperficie(0);
    return 0;
  }
}, [points]);


  // Check for overlaps with other permits (mock implementation)
  const checkForOverlaps = useCallback(() => {
    // In a real app, this would call an API with the polygon coordinates
    const mockOverlap = Math.random() > 0.7; // 30% chance of overlap for demo
    if (mockOverlap) {
      setOverlapDetected(true);
      setOverlapPermit(`PXM-${Math.floor(Math.random() * 9000) + 1000}`);
    } else {
      setOverlapDetected(false);
      setOverlapPermit('');
    }
  }, [points]);

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
  const polygonValid = points.length >= 3;
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

  return (
    <div className="cadastre-app">
      <header className="app-header">
        <h1>Définir le périmètre du permis minier</h1>
        <p className="subtitle">Délimitation géographique et vérification des empiètements territoriaux</p>
      </header>

      <div className="app-layout">
        {/* Left Panel - Map */}
        <section className="map-container">
          <div className="map-header">
            <h2>
              <FiMapPin /> Carte interactive
              <span className="badge">{points.length} points</span>
            </h2>
            <div className="map-controls">
              <button 
                className={`map-btn ${isDrawing ? 'active' : ''}`}
                onClick={() => setIsDrawing(!isDrawing)}
              >
                <FiEdit2 /> {isDrawing ? 'Mode dessin actif' : 'Dessiner un polygone'}
              </button>
              <button className="map-btn" onClick={calculateArea}>
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
              // This would update the points if the polygon is edited directly on the map
              if (polygon && polygon.length >= 3) {
                setPoints(polygon.map((coord, i) => ({
                  id: generateId(),
                  x: coord[0].toString(),
                  y: coord[1].toString(),
                  z: '0'
                })));
              }
            }}
          />

          <div className="map-footer">
            <div className="area-display">
              <span>Superficie calculée:</span>
              <strong>{superficie.toLocaleString()} ha</strong>
            </div>
            <div className="map-export">
              <button className="export-btn" onClick={exportData}>
                <FiDownload /> Exporter
              </button>
              <label className="import-btn">
                <FiUpload /> Importer
                <input type="file" accept=".json" onChange={importData} hidden />
              </label>
            </div>
          </div>
        </section>

        {/* Right Panel - Data */}
        <section className="data-panel">
          <div className="panel-tabs">
            <button 
              className={`tab-btn ${activeTab === 'coordinates' ? 'active' : ''}`}
              onClick={() => setActiveTab('coordinates')}
            >
              Coordonnées
            </button>
            <button 
              className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
              onClick={() => setActiveTab('validation')}
            >
              Validation
            </button>
            <button 
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Résumé
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'coordinates' && (
              <>
                <div className="table-header">
                  <h3>Points du périmètre</h3>
                  <button className="add-btn" onClick={() => addPoint()}>
                    <FiPlus /> Ajouter
                  </button>
                </div>
                
                <div className="coordinates-table">
                  <div className="table-row header">
                    <div>#</div>
                    <div>Longitude (X)</div>
                    <div>Latitude (Y)</div>
                    <div>Altitude (Z)</div>
                    <div>Actions</div>
                  </div>
                  
                  {points.map((point, index) => (
                    <div className="table-row" key={point.id}>
                      <div>{index + 1}</div>
                      <div>
                        <input
                          type="number"
                          step="0.000001"
                          value={point.x}
                          onChange={(e) => handleChange(point.id, 'x', e.target.value)}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.000001"
                          value={point.y}
                          onChange={(e) => handleChange(point.id, 'y', e.target.value)}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={point.z}
                          onChange={(e) => handleChange(point.id, 'z', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <button 
                          className="delete-btn"
                          onClick={() => removePoint(point.id)}
                          disabled={points.length <= 3}
                          title={points.length <= 3 ? "Un polygone doit avoir au moins 3 points" : "Supprimer ce point"}
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
              <div className="validation-section">
                <div className={`validation-card ${overlapDetected ? 'error' : 'success'}`}>
                  <div className="card-header">
                    {overlapDetected ? <FiAlertTriangle /> : <FiCheckCircle />}
                    <h3>Vérification des empiètements</h3>
                  </div>
                  {overlapDetected ? (
                    <>
                      <p>Empiètement détecté avec le permis {overlapPermit}</p>
                      <textarea
                        placeholder="Ajouter une remarque sur cet empiètement..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </>
                  ) : (
                    <p>Aucun empiètement détecté</p>
                  )}
                </div>

                <div className={`validation-card ${!polygonValid || !allFilled ? 'warning' : 'success'}`}>
                  <div className="card-header">
                    {!polygonValid || !allFilled ? <FiAlertTriangle /> : <FiCheckCircle />}
                    <h3>Validation du polygone</h3>
                  </div>
                  {!polygonValid && <p>• Au moins 3 points requis pour former un polygone</p>}
                  {!allFilled && <p>• Toutes les coordonnées doivent être renseignées</p>}
                  {polygonValid && allFilled && <p>Le polygone est valide</p>}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="summary-section">
                <div className="summary-card">
                  <h3>Informations administratives</h3>
                  <div className="info-grid">
                    <div>
                      <label>Code permis</label>
                      <input
                        value={permitData.code}
                        onChange={(e) => setPermitData({...permitData, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Type permis</label>
                      <input
                        value={permitData.type}
                        onChange={(e) => setPermitData({...permitData, type: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Titulaire</label>
                      <input
                        value={permitData.holder}
                        onChange={(e) => setPermitData({...permitData, holder: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Wilaya</label>
                      <input
                        value={permitData.wilaya}
                        onChange={(e) => setPermitData({...permitData, wilaya: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Daira</label>
                      <input
                        value={permitData.daira}
                        onChange={(e) => setPermitData({...permitData, daira: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Commune</label>
                      <input
                        value={permitData.commune}
                        onChange={(e) => setPermitData({...permitData, commune: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <h3>Caractéristiques techniques</h3>
                  <div className="info-grid">
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
                      <p className={polygonValid && allFilled ? 'valid' : 'invalid'}>
                        {polygonValid && allFilled ? 'Valide' : 'Non valide'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button className="secondary-btn">
              <FiChevronLeft /> Retour
            </button>
            <div className="action-group">
              <button className="secondary-btn">
                Enregistrer brouillon
              </button>
              <button 
  className="primary-btn"
  disabled={!polygonValid || !allFilled}
  onClick={saveCoordinatesToBackend}
>
  <FiSave /> Valider le périmètre
</button>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
