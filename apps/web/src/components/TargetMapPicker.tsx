import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';

export type TargetMapPickerProps = {
  lat: number;
  lon: number;
  epicenterLat: number;
  epicenterLon: number;
  onChange: (next: { lat: number; lon: number }) => void;
};

function fitMapToPoints(map: LeafletMap, epicenter: LatLngExpression, target: LatLngExpression) {
  const bounds = L.latLngBounds(epicenter as [number, number], target as [number, number]);

  if (!bounds.isValid()) {
    map.setView(epicenter, 5, { animate: true });
    return;
  }

  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    map.setView(bounds.getCenter(), 6, { animate: true });
    return;
  }

  map.fitBounds(bounds.pad(0.65), {
    animate: true,
    padding: [48, 48],
    maxZoom: 7,
  });
}

function MapViewportController({
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

function MapClickHandler({ onChange }: { onChange: (next: { lat: number; lon: number }) => void }) {
  useMapEvents({
    click(event) {
      onChange({
        lat: Number(event.latlng.lat.toFixed(6)),
        lon: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function MapInstanceBridge({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

export default function TargetMapPicker({
  lat,
  lon,
  epicenterLat,
  epicenterLon,
  onChange,
}: TargetMapPickerProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  const epicenter = useMemo<LatLngExpression>(() => [epicenterLat, epicenterLon], [epicenterLat, epicenterLon]);
  const target = useMemo<LatLngExpression>(() => [lat, lon], [lat, lon]);

  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance((current) => current ?? map);
  }, []);

  return (
    <div className="relative h-full min-h-[540px] w-full bg-slate-100 lg:min-h-[720px]">
      <MapContainer center={[-2.5, 118]} zoom={5} minZoom={4} zoomControl={false} className="h-full w-full">
        <MapInstanceBridge onReady={handleMapReady} />
        <MapViewportController epicenter={epicenter} target={target} />
        <MapClickHandler onChange={onChange} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={[epicenter, target]}
          pathOptions={{ color: '#135bec', dashArray: '8 10', weight: 2, opacity: 0.9 }}
        />

        <Circle
          center={epicenter}
          radius={90000}
          pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1.5 }}
        />
        <CircleMarker
          center={epicenter}
          radius={10}
          pathOptions={{ color: '#ffffff', fillColor: '#dc2626', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            Episenter
          </Tooltip>
        </CircleMarker>

        <Circle
          center={target}
          radius={55000}
          pathOptions={{ color: '#135bec', fillColor: '#135bec', fillOpacity: 0.08, weight: 1.5 }}
        />
        <CircleMarker
          center={target}
          radius={10}
          pathOptions={{ color: '#ffffff', fillColor: '#135bec', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            Lokasi target
          </Tooltip>
        </CircleMarker>
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-sm rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Interaksi peta</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Klik area peta untuk memindahkan titik target. Penanda merah menunjukkan episenter, sedangkan penanda biru menunjukkan lokasi pembelajaran yang akan dianalisis.
        </p>
      </div>

      <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => mapInstance?.zoomIn()}
          className="flex size-11 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-lg transition-colors hover:text-primary"
          aria-label="Perbesar peta"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
        </button>
        <button
          type="button"
          onClick={() => mapInstance?.zoomOut()}
          className="flex size-11 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-lg transition-colors hover:text-primary"
          aria-label="Perkecil peta"
        >
          <span className="material-symbols-outlined text-[22px]">remove</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!mapInstance) return;
            fitMapToPoints(mapInstance, epicenter, target);
          }}
          className="flex size-11 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-lg transition-colors hover:text-primary"
          aria-label="Pusatkan peta"
        >
          <span className="material-symbols-outlined text-[22px]">my_location</span>
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-lg backdrop-blur-sm">
        Garis biru memperlihatkan jarak dari episenter ke target simulasi.
      </div>

      <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-2xl bg-slate-900/80 px-4 py-3 text-xs text-white shadow-lg backdrop-blur-sm">
        <p className="font-semibold uppercase tracking-[0.18em] text-blue-200">Koordinat target</p>
        <p className="mt-2 font-mono">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
