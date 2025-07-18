
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';

type Point = {
  id: string;
  x: string;
  y: string;
  z: string;
};

interface ArcGISMapProps {
  points: Point[];
  superficie: number;
  isDrawing: boolean;
  onPointAdd?: (lat: number, lng: number) => void;
  onAreaCalculated?: (areaHa: number) => void;
}

export default function ArcGISMap({ 
  points, 
  superficie,
  isDrawing,
  onPointAdd,
  onAreaCalculated
}: ArcGISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([28.0339, 1.6596], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;

    if (isDrawing) {
      map.doubleClickZoom.disable();
      map.on('click', handleMapClick);
    } else {
      map.doubleClickZoom.enable();
      map.off('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing, onPointAdd]);

  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter valid points and convert to Leaflet LatLngs
    const validPoints = points.filter(p => p.x && p.y && !isNaN(+p.x) && !isNaN(+p.y));
    const latLngs = validPoints.map(p => L.latLng(+p.y, +p.x));

    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    if (latLngs.length >= 3) {
      polygonRef.current = L.polygon(latLngs, {
        color: '#2563eb',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.3
      }).addTo(map);

      map.fitBounds(polygonRef.current.getBounds());

      // Turf.js for area
      const coords = latLngs.map(ll => [ll.lng, ll.lat]);
      if (coords[0][0] !== coords[coords.length - 1][0] ||
          coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0]); // Close polygon
      }

      try {
        const turfPolygon = turf.polygon([coords]);
        const areaInSqMeters = turf.area(turfPolygon);
        const areaInHectares = areaInSqMeters / 10_000;
        onAreaCalculated?.(parseFloat(areaInHectares.toFixed(2)));
      } catch (err) {
        console.warn('Turf error:', err);
      }
    }

    // Add markers
    validPoints.forEach((point, index) => {
      const marker = L.marker([+point.y, +point.x], {
        icon: L.divIcon({
          className: 'map-marker',
          html: `<div>${index + 1}</div>`,
          iconSize: [24, 24]
        })
      }).addTo(map);
      markersRef.current.push(marker);
    });
  }, [points]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    onPointAdd?.(e.latlng.lat, e.latlng.lng);
  };

  return (
    <div 
      ref={mapRef} 
      className="map-view"
      style={{ cursor: isDrawing ? 'crosshair' : 'grab' }}
    />
  );
}
