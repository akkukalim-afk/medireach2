'use client';

import React, { useEffect, useRef } from 'react';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'user' | 'current_pharmacy' | 'fallback_pharmacy' | 'normal_pharmacy';
  distanceKm?: number;
  etaMinutes?: number;
  score?: number;
  stockMatchRatio?: number;
  allInStock?: boolean;
  onSelect?: () => void;
}

interface LeafletMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

export default function LeafletMap({
  markers,
  center = [13.1007, 77.5963], // Default Yelahanka center
  zoom = 14,
  className = '',
  height = '380px',
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Ensure leaflet styles are loaded
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        layerGroupRef.current = layerGroup;
      }

      // Update markers
      if (layerGroupRef.current && isMounted) {
        layerGroupRef.current.clearLayers();

        const latLngBounds: [number, number][] = [];

        markers.forEach((m) => {
          let pinColor = '#16A34A'; // brand green
          let iconLetter = '💊';

          if (m.type === 'user') {
            pinColor = '#2563EB'; // blue
            iconLetter = '📍';
          } else if (m.type === 'current_pharmacy') {
            pinColor = '#DC2626'; // delayed red/amber
            iconLetter = '⏳';
          } else if (m.type === 'fallback_pharmacy') {
            pinColor = '#16A34A'; // green
            iconLetter = '✨';
          }

          const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div style="
                background-color: ${pinColor};
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 3px solid white;
                cursor: pointer;
              ">
                ${iconLetter}
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18],
          });

          const marker = L.marker([m.lat, m.lng], { icon: customIcon });

          const popupContent = document.createElement('div');
          popupContent.style.minWidth = '200px';
          popupContent.style.padding = '4px';

          popupContent.innerHTML = `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #0f172a;">
              ${m.title}
            </div>
            ${m.subtitle ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${m.subtitle}</div>` : ''}
            <div style="display: flex; gap: 8px; font-size: 11px; margin-bottom: 8px;">
              ${m.distanceKm !== undefined ? `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">🚗 ${m.distanceKm} km</span>` : ''}
              ${m.etaMinutes !== undefined ? `<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 600;">⏱️ ${m.etaMinutes} mins</span>` : ''}
            </div>
            ${
              m.type === 'fallback_pharmacy'
                ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #15803d; font-weight: 600; margin-bottom: 8px;">
                     ✓ All Items in Stock
                   </div>`
                : ''
            }
          `;

          if (m.onSelect) {
            const btn = document.createElement('button');
            btn.innerText = m.type === 'fallback_pharmacy' ? '⚡ Switch to this Pharmacy' : 'View Store';
            btn.style.width = '100%';
            btn.style.padding = '6px 12px';
            btn.style.backgroundColor = '#16A34A';
            btn.style.color = 'white';
            btn.style.borderRadius = '6px';
            btn.style.fontWeight = '600';
            btn.style.fontSize = '12px';
            btn.style.cursor = 'pointer';
            btn.style.border = 'none';
            btn.onclick = () => {
              m.onSelect?.();
            };
            popupContent.appendChild(btn);
          }

          marker.bindPopup(popupContent);
          layerGroupRef.current.addLayer(marker);
          latLngBounds.push([m.lat, m.lng]);
        });

        // Fit map bounds if multiple markers exist
        if (latLngBounds.length > 1 && mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(latLngBounds, { padding: [40, 40] });
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [markers, center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}
      style={{ height }}
    />
  );
}

