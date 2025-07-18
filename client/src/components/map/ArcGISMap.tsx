'use client';

import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import styles from '../../../pages/demande/step6/cadastre.module.css'
type Coordinate = {
  id: string;
  x: string;
  y: string;
  z: string;
};

interface ArcGISMapProps {
  points: Coordinate[];
  superficie: number;
  isDrawing: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onPolygonChange?: (coordinates: [number, number][]) => void;
  existingPolygons?: { [id: string]: [number, number][] };
  layerType?: string;
}

const ArcGISMap = forwardRef(({
  points,
  superficie,
  isDrawing,
  onMapClick,
  onPolygonChange,
  existingPolygons = {},
  layerType = 'topographie'
}: ArcGISMapProps, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const existingLayersRef = useRef<{[id: string]: L.Layer}>({});
const centerMarkerRef = useRef<L.Marker | null>(null);

  // Expose map functions to parent
  useImperativeHandle(ref, () => ({
    getMap: () => mapInstance.current,
    fitBounds: (bounds: L.LatLngBounds) => {
      if (mapInstance.current) {
        mapInstance.current.fitBounds(bounds);
      }
    }
  }));

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([28.0339, 1.6596], 5);

    // Base layers
    const baseLayers = {
      'Topographie': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      'Géologie': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      'Cadastre Minier': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
    };

    // Add default layer
    baseLayers['Topographie'].addTo(map);

    // Initialize feature group to store drawn items
    drawnItemsRef.current = new L.FeatureGroup().addTo(map);

    // Initialize draw control
    drawControlRef.current = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsRef.current
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          metric: true,
          shapeOptions: {
            color: '#2563eb',
            fillOpacity: 0.3
          }
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      }
    });

    mapInstance.current = map;

    // Force Leaflet to recalculate size after render
    // Inside your first useEffect where you create the map:
setTimeout(() => {
  if (mapRef.current && mapInstance.current) {
    requestAnimationFrame(() => {
      mapInstance.current?.invalidateSize();
    });
  }
}, 500); // Increase delay slightly if needed


    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update layer when layerType changes
  // Update layer when layerType changes
useEffect(() => {
  if (!mapInstance.current) return;
  
  const map = mapInstance.current;
  
  // Remove all tile layers except the one we're about to add
  map.eachLayer(layer => {
    // Only remove tile layers that aren't our drawn items
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });

  // Add the appropriate base layer based on layerType
  switch(layerType) {
    case 'geologie':
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
      break;
    case 'minier':
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png').addTo(map);
      break;
    default:
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }
}, [layerType]);

  // Handle drawing events
  useEffect(() => {
    if (!mapInstance.current || !drawnItemsRef.current) return;
    const map = mapInstance.current;

    const handleDrawCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;
      drawnItemsRef.current?.clearLayers();
      drawnItemsRef.current?.addLayer(layer);

      if (layer instanceof L.Polygon) {
        const coords = layer.getLatLngs()[0] as L.LatLng[];
        const simplifiedCoords = coords.map(latLng => [latLng.lng, latLng.lat]) as [number, number][];
        onPolygonChange?.(simplifiedCoords);
      }
    };

    const handleDrawEdited = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited;
      const layers = event.layers.getLayers();
      if (layers.length > 0 && layers[0] instanceof L.Polygon) {
        const coords = (layers[0] as L.Polygon).getLatLngs()[0] as L.LatLng[];
        const simplifiedCoords = coords.map(latLng => [latLng.lng, latLng.lat]) as [number, number][];
        onPolygonChange?.(simplifiedCoords);
      }
    };

    const drawControl = drawControlRef.current;

    if (isDrawing && drawControl) {
      setTimeout(() => {
        map.addControl(drawControl);
      }, 0);
      map.on(L.Draw.Event.CREATED, handleDrawCreated);
      map.on(L.Draw.Event.EDITED, handleDrawEdited);
    }

    return () => {
      if (drawControl) {
        map.removeControl(drawControl);
      }
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.EDITED, handleDrawEdited);
    };
  }, [isDrawing, onPolygonChange]);

  // Handle map click
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isDrawing && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isDrawing, onMapClick]);

  // Update existing polygons
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear previous existing polygons
    Object.values(existingLayersRef.current).forEach(layer => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    existingLayersRef.current = {};

    // Draw all existing polygons
    Object.entries(existingPolygons).forEach(([code_demande, coords]) => {
      if (coords.length < 3) return;

      const latLngs = coords.map(([x, y]) => L.latLng(y, x));
      const polygon = L.polygon(latLngs, {
        color: '#dc2626',
        weight: 1,
        dashArray: '5,5',
        fillOpacity: 0.2
      }).addTo(map);

      // Store reference
      existingLayersRef.current[code_demande] = polygon;

      // Add label
      const center = polygon.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: 'polygon-label',
          html: `<div>${code_demande}</div>`,
          iconSize: [80, 20],
        }),
        interactive: false
      }).addTo(map);

      existingLayersRef.current[`${code_demande}-label`] = label;
    });
  }, [existingPolygons]);

  // Update polygon and markers when points change
  useEffect(() => {
  if (!mapInstance.current || !drawnItemsRef.current) return;

  // Remove existing center marker
  if (centerMarkerRef.current) {
   if (centerMarkerRef.current && mapInstance.current?.hasLayer(centerMarkerRef.current)) {
    mapInstance.current.removeLayer(centerMarkerRef.current);
    centerMarkerRef.current = null;
  }
  }

  // Clear existing markers
  markersRef.current.forEach(marker => {
    marker.remove();
  });
  markersRef.current = [];

  // Filter valid points
  const validPoints = points.filter(p => p.x && p.y && !isNaN(Number(p.x)) && !isNaN(Number(p.y)));
  const latLngs = validPoints.map(p => L.latLng(Number(p.y), Number(p.x)));

  // Remove existing polygon from drawn items
  drawnItemsRef.current.clearLayers();

  // Create new polygon if we have enough points
 if (latLngs.length >= 3) {
  const polygon = L.polygon(latLngs, {
    color: '#2563eb',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.3
  });

  // Add polygon to drawn items FIRST
  drawnItemsRef.current.addLayer(polygon);
  polygonRef.current = polygon;

  // Delay fitBounds and center marker to let the polygon render first
  setTimeout(() => {
    // ✅ Defensive: make sure polygon is still on the map
    if (!mapInstance.current?.hasLayer(polygon)) return;

const bounds = polygon.getBounds();
const centroid = bounds.getCenter();
const offsetLatLng = L.latLng(centroid.lat + 0.001, centroid.lng); // slight north offset

    // Remove previous center marker if any
    if (centerMarkerRef.current && mapInstance.current.hasLayer(centerMarkerRef.current)) {
      mapInstance.current.removeLayer(centerMarkerRef.current);
    }

    // Add new center marker
    centerMarkerRef.current = L.marker(offsetLatLng, {
  icon: L.divIcon({
    className: 'new-site-label', // 👈 apply the new style
    html: `<div>Nouveau</div>`,
    iconSize: [70, 20],
  }),
  interactive: false
}).addTo(mapInstance.current!);

    mapInstance.current.fitBounds(polygon.getBounds());
  }, 0); // short delay after rendering
}

    // Add markers for each point
    validPoints.forEach((point, index) => {
      const marker = L.marker([Number(point.y), Number(point.x)], {
        icon: L.divIcon({
          className: 'map-marker',
          html: `<div>${index + 1}</div>`,
          iconSize: [24, 24]
        }),
        draggable: true
      }).addTo(mapInstance.current!);

      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        if (onPolygonChange) {
          // Update all points with new position
          const updatedPoints = [...points];
          updatedPoints[index] = {
            ...updatedPoints[index],
            x: newLatLng.lng.toString(),
            y: newLatLng.lat.toString()
          };
          onPolygonChange(updatedPoints.map(p => [parseFloat(p.x), parseFloat(p.y)]));
        }
      });

      markersRef.current.push(marker);
    });
  }, [points, onPolygonChange]);

  return (
    <div 
      ref={mapRef} 
      className={styles['map-view']}
      style={{ cursor: isDrawing ? 'crosshair' : 'grab' }}
    />
  );
});

ArcGISMap.displayName = 'ArcGISMap';

export default ArcGISMap;