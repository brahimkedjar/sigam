'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  FiPlus, 
  FiTrash2, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiX, 
  FiMapPin,
  FiEdit2,
  FiRefreshCw,
  FiChevronLeft,
  FiSave
} from 'react-icons/fi';

// 🧠 Dynamic import with SSR disabled
const ArcGISMap = dynamic(() => import('../../src/components/map/arcgismapv2'), {
  ssr: false,
  loading: () => <div>Chargement de la carte...</div>,
});


type Point = {
  id: string;
  x: string;
  y: string;
  z: string;
};

export default function CadastrePage() {

const testPoints: Point[] = [
  { id: '1', x: '-0.3081', y: '27.8741', z: '290' },
  { id: '2', x: '-0.3061', y: '27.8741', z: '290' },
  { id: '3', x: '-0.3061', y: '27.8721', z: '290' },
  { id: '4', x: '-0.3081', y: '27.8721', z: '290' },
  { id: '5', x: '-0.3081', y: '27.8741', z: '290' } // Close the ring (same as point 1)
];
  const [superficie, setSuperficie] = useState(18968.95);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState('coordinates');
  const [comment, setComment] = useState('');
const [points, setPoints] = useState<Point[]>(testPoints);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addPoint = () => {
    setPoints([...points, { id: generateId(), x: '', y: '', z: '' }]);
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };

  const handleChange = (id: string, key: string, value: string) => {
    setPoints(points.map(p => 
      p.id === id ? { ...p, [key]: value } : p
    ));
  };

 const calculateArea = useCallback(() => {
  // This just triggers redraw, actual calc happens in ArcGISMap
  setPoints([...points]); // force update
}, [points]);

  const polygonValid = points.length >= 3 && points.length % 2 === 0;
  const allFilled = points.every(p => p.x && p.y && p.z);
  const hasOverlap = true; // Would come from API

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
  points={points} 
  superficie={superficie}
  isDrawing={isDrawing}
  onPointAdd={(lat, lng) => {
    const id = generateId();
    setPoints([...points, { id, x: lng.toString(), y: lat.toString(), z: '0' }]);
  }}
  onAreaCalculated={(area) => setSuperficie(area)} // ✅ update area
/>

          <div className="map-footer">
            <div className="area-display">
              <span>Superficie calculée:</span>
              <strong>{superficie.toLocaleString()} ha</strong>
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
                  <button className="add-btn" onClick={addPoint}>
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
                          type="text"
                          value={point.x}
                          onChange={(e) => handleChange(point.id, 'x', e.target.value)}
                          placeholder="0.0000"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={point.y}
                          onChange={(e) => handleChange(point.id, 'y', e.target.value)}
                          placeholder="0.0000"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
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
                <div className={`validation-card ${hasOverlap ? 'error' : 'success'}`}>
                  <div className="card-header">
                    {hasOverlap ? <FiAlertTriangle /> : <FiCheckCircle />}
                    <h3>Vérification des empiètements</h3>
                  </div>
                  {hasOverlap ? (
                    <>
                      <p>Empiètement détecté avec le permis PXM-2022-008</p>
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
                  {!polygonValid && <p>• Le nombre de sommets doit être pair</p>}
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
                      <p>PXM-2025-014</p>
                    </div>
                    <div>
                      <label>Type permis</label>
                      <p>Exploration de mines (PEM)</p>
                    </div>
                    <div>
                      <label>Titulaire</label>
                      <p>SARL Atlas Mining</p>
                    </div>
                    <div>
                      <label>Wilaya</label>
                      <p>Adrar</p>
                    </div>
                    <div>
                      <label>Daira</label>
                      <p>Alger Centre</p>
                    </div>
                    <div>
                      <label>Commune</label>
                      <p>Alger Centre</p>
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