import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngExpression, Map as LeafletMap } from 'leaflet';
import type { ImpactCellSummary } from '@simulasi-gempa/shared-types';

export type ImpactGridMapProps = {
  epicenterLat: number;
  epicenterLon: number;
  targetLat: number;
  targetLon: number;
  targetLabel: string;
  stepKm: number;
  cells: ImpactCellSummary[];
  selectedCellId: string;
  onSelectCell: (cell: ImpactCellSummary) => void;
};

function getCellColor(impactClass: ImpactCellSummary['impactClass']) {
  switch (impactClass) {
    case 'light':
      return '#22c55e';
    case 'moderate':
      return '#eab308';
    default:
      return '#dc2626';
  }
}

function buildBounds(points: LatLngExpression[]): LatLngBoundsExpression {
  return points as LatLngBoundsExpression;
}

function MapViewportController({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, {
        animate: true,
        padding: [42, 42],
        maxZoom: 10,
      });
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bounds, map]);

  return null;
}

function MapInstanceBridge({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

export default function ImpactGridMap({
  epicenterLat,
  epicenterLon,
  targetLat,
  targetLon,
  targetLabel,
  stepKm,
  cells,
  selectedCellId,
  onSelectCell,
}: ImpactGridMapProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  const epicenter = useMemo<LatLngExpression>(() => [epicenterLat, epicenterLon], [epicenterLat, epicenterLon]);
  const target = useMemo<LatLngExpression>(() => [targetLat, targetLon], [targetLat, targetLon]);
  const cellRadiusMeters = Math.max(1500, stepKm * 550);

  const bounds = useMemo(() => {
    const points: LatLngExpression[] = [epicenter, target, ...cells.map((cell) => [cell.lat, cell.lon] as LatLngExpression)];
    return buildBounds(points);
  }, [cells, epicenter, target]);

  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance((current) => current ?? map);
  }, []);

  return (
    <div className="relative h-full w-full bg-slate-100">
      <MapContainer center={[targetLat, targetLon]} zoom={8} minZoom={5} zoomControl={false} className="h-full w-full">
        <MapInstanceBridge onReady={handleMapReady} />
        <MapViewportController bounds={bounds} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cells.map((cell) => {
          const isSelected = cell.id === selectedCellId;
          const cellColor = getCellColor(cell.impactClass);

          return (
            <Circle
              key={cell.id}
              center={[cell.lat, cell.lon]}
              radius={cellRadiusMeters}
              pathOptions={{
                color: isSelected ? '#0f172a' : cellColor,
                weight: isSelected ? 2 : 1,
                fillColor: cellColor,
                fillOpacity: isSelected ? 0.5 : 0.28,
              }}
              eventHandlers={{
                click: () => onSelectCell(cell),
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-semibold">MMI {cell.mmiRoman}</div>
                  <div>{cell.intensityLabel}</div>
                  <div>Risk {cell.riskLevel}</div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        <Polyline positions={[epicenter, target]} pathOptions={{ color: '#135bec', dashArray: '8 10', weight: 2 }} />

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

      <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-xs rounded-2xl border border-white/70 bg-white/92 p-4 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Grid Dampak</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Klik sel grid untuk mengganti fokus analisis. Warna hijau, kuning, dan merah menunjukkan tingkat dampak spasial hasil simulasi.
        </p>
      </div>

      <div className="absolute bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <button
            type="button"
            className="flex size-10 items-center justify-center border-b border-slate-100 bg-white text-slate-900 transition-colors hover:bg-slate-50"
            onClick={() => mapInstance?.zoomIn()}
            aria-label="Perbesar"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center bg-white text-slate-900 transition-colors hover:bg-slate-50"
            onClick={() => mapInstance?.zoomOut()}
            aria-label="Perkecil"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg bg-white text-primary shadow-lg transition-colors hover:bg-slate-50"
          onClick={() => mapInstance?.fitBounds(bounds, { animate: true, padding: [42, 42], maxZoom: 10 })}
          aria-label="Pusatkan"
        >
          <span className="material-symbols-outlined">near_me</span>
        </button>
      </div>
    </div>
  );
}
