import { useEffect, useMemo } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import type { WaveTimeline } from '@simulasi-gempa/shared-types';

type WavePropagationMapProps = {
  epicenterLat: number;
  epicenterLon: number;
  targetLat: number;
  targetLon: number;
  targetLabel: string;
  currentTime: number;
  waveTimeline: WaveTimeline | null;
};

function fitMapToPoints(
  map: LeafletMap,
  epicenter: LatLngExpression,
  target: LatLngExpression,
) {
  const bounds = L.latLngBounds(
    epicenter as [number, number],
    target as [number, number],
  );

  if (!bounds.isValid()) {
    map.setView(epicenter, 6, { animate: true });
    return;
  }

  map.fitBounds(bounds.pad(0.55), {
    animate: true,
    padding: [40, 40],
    maxZoom: 8,
  });
}

function ViewportController({
  epicenter,
  target,
}: {
  epicenter: LatLngExpression;
  target: LatLngExpression;
}) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
      fitMapToPoints(map, epicenter, target);
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [map, epicenter, target]);

  return null;
}

export default function WavePropagationMap({
  epicenterLat,
  epicenterLon,
  targetLat,
  targetLon,
  targetLabel,
  currentTime,
  waveTimeline,
}: WavePropagationMapProps) {
  const epicenter = useMemo<LatLngExpression>(() => [epicenterLat, epicenterLon], [epicenterLat, epicenterLon]);
  const target = useMemo<LatLngExpression>(() => [targetLat, targetLon], [targetLat, targetLon]);

  const pWaveVelocity = waveTimeline?.pWaveVelocityKmPerSec ?? 6;
  const sWaveVelocity = waveTimeline?.sWaveVelocityKmPerSec ?? 3.5;
  const distanceKm = waveTimeline?.hypocentralDistanceKm ?? 0;

  const pWaveRadiusKm = Math.min(distanceKm, currentTime * pWaveVelocity);
  const sWaveRadiusKm = Math.min(distanceKm, currentTime * sWaveVelocity);

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        minZoom={4}
        className="h-full w-full"
        zoomControl={false}
      >
        <ViewportController epicenter={epicenter} target={target} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={[epicenter, target]}
          pathOptions={{ color: '#0f172a', dashArray: '8 8', weight: 2, opacity: 0.65 }}
        />

        <Circle
          center={epicenter}
          radius={Math.max(5000, pWaveRadiusKm * 1000)}
          pathOptions={{ color: '#135bec', fillOpacity: 0.08, weight: 2 }}
        />
        <Circle
          center={epicenter}
          radius={Math.max(3000, sWaveRadiusKm * 1000)}
          pathOptions={{ color: '#f97316', fillOpacity: 0.1, weight: 2 }}
        />

        <CircleMarker
          center={epicenter}
          radius={9}
          pathOptions={{ color: '#ffffff', fillColor: '#dc2626', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            Episentrum
          </Tooltip>
        </CircleMarker>

        <CircleMarker
          center={target}
          radius={9}
          pathOptions={{ color: '#ffffff', fillColor: '#135bec', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            {targetLabel}
          </Tooltip>
        </CircleMarker>
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Legenda</p>
        <div className="mt-2 space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full border-2 border-[#135bec]" />
            <span>Gelombang P</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full border-2 border-[#f97316]" />
            <span>Gelombang S</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status propagasi</p>
        <p className="mt-1 text-sm text-slate-700">P-wave: {pWaveRadiusKm.toFixed(1)} km</p>
        <p className="text-sm text-slate-700">S-wave: {sWaveRadiusKm.toFixed(1)} km</p>
      </div>
    </div>
  );
}