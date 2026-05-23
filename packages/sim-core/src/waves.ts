import type { WaveTimeline } from '@simulasi-gempa/shared-types';
import { computeHypocentralDistance } from './distance.js';

const P_WAVE_SPEED_KM_PER_SEC = 6.0;
const S_WAVE_SPEED_KM_PER_SEC = 3.5;

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function computeWaveTimeline(distanceKm: number, depthKm: number, magnitude = 6): WaveTimeline {
  const hypocentralDistanceKm = computeHypocentralDistance(distanceKm, depthKm);
  const pArrivalSec = hypocentralDistanceKm / P_WAVE_SPEED_KM_PER_SEC;
  const sArrivalSec = hypocentralDistanceKm / S_WAVE_SPEED_KM_PER_SEC;

  const magnitudeDurationTerm = 4 + magnitude * 2.8;
  const distanceDecay = Math.min(7, distanceKm * 0.04);
  const durationSec = Math.max(sArrivalSec + 4, magnitudeDurationTerm - distanceDecay);
  const mainShockSec = Math.min(durationSec, sArrivalSec + Math.max(1.5, magnitude * 0.35));

  return {
    pArrivalSec: round2(pArrivalSec),
    sArrivalSec: round2(sArrivalSec),
    mainShockSec: round2(mainShockSec),
    durationSec: round2(durationSec),
    hypocentralDistanceKm: round2(hypocentralDistanceKm),
    pWaveVelocityKmPerSec: P_WAVE_SPEED_KM_PER_SEC,
    sWaveVelocityKmPerSec: S_WAVE_SPEED_KM_PER_SEC,
    events: [
      {
        key: 'p_wave',
        title: 'Gelombang P Tiba',
        description: 'Gelombang primer datang lebih dulu dan biasanya menjadi sinyal awal guncangan.',
        timeSec: round2(pArrivalSec),
        icon: 'radio_button_checked',
        accent: 'primary',
      },
      {
        key: 's_wave',
        title: 'Gelombang S Tiba',
        description: 'Gelombang sekunder lebih lambat, tetapi biasanya membawa guncangan lateral yang lebih kuat.',
        timeSec: round2(sArrivalSec),
        icon: 'waves',
        accent: 'orange',
      },
      {
        key: 'main_shock',
        title: 'Guncangan Utama',
        description: 'Pada fase ini energi guncangan mencapai puncak pedagogis untuk dianalisis di kelas.',
        timeSec: round2(mainShockSec),
        icon: 'warning',
        accent: 'red',
      },
    ],
  };
}
