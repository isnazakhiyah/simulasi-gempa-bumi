import type {
  BuildingProfileCode,
  SimulationRunSummary,
  SimulationTargetSummary,
  ScenarioMode,
} from '@simulasi-gempa/shared-types';
import { computeGroundMotionIndex } from './attenuation.js';
import { assessBuildingImpact } from './buildings.js';
import { computeEpicentralDistance, computeHypocentralDistance, type GeoPoint } from './distance.js';
import { buildImpactGrid, buildTargetCellSummary, findClosestImpactCell } from './grid.js';
import { convertGroundMotionToMMI, getMmiIntensityLabel, getMmiRoman } from './mmi.js';
import { classifyRisk } from './risk.js';
import { computeWaveTimeline } from './waves.js';

export interface SimulateScenarioInput {
  scenarioId: string;
  title: string;
  mode: ScenarioMode;
  epicenter: GeoPoint;
  target: GeoPoint & { label: string };
  magnitude: number;
  depthKm: number;
  siteFactor: number;
  buildingProfileCode: BuildingProfileCode;
  gridStepKm?: number;
  gridRadiusKm?: number;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function buildPedagogicalNotes(
  targetSummary: SimulationTargetSummary,
  durationSec: number,
  mode: ScenarioMode,
) {
  return [
    `Magnitudo menggambarkan energi di sumber, sedangkan intensitas di target ${targetSummary.label} berubah menurut jarak dan kondisi lokal simulasi.`,
    `Gelombang P diperkirakan tiba pada ${targetSummary.epicentralDistanceKm.toFixed(1)} km dari episenter lebih dahulu daripada gelombang S, sehingga siswa dapat membedakan fase perambatan secara temporal.`,
    `Dengan durasi guncangan sekitar ${durationSec.toFixed(1)} detik, skenario ${mode === 'real_event' ? 'berbasis event nyata' : 'hipotetik'} ini cocok untuk membandingkan pengaruh parameter terhadap dampak bangunan.`,
  ];
}

export function simulateScenario(input: SimulateScenarioInput): SimulationRunSummary {
  const epicentralDistanceKm = computeEpicentralDistance(input.epicenter, input.target);
  const hypocentralDistanceKm = computeHypocentralDistance(epicentralDistanceKm, input.depthKm);
  const groundMotionIndex = computeGroundMotionIndex({
    magnitude: input.magnitude,
    hypocentralDistanceKm,
    depthKm: input.depthKm,
    siteFactor: input.siteFactor,
  });
  const mmiNumeric = convertGroundMotionToMMI(groundMotionIndex);

  const targetSummary: SimulationTargetSummary = {
    label: input.target.label,
    lat: input.target.lat,
    lon: input.target.lon,
    epicentralDistanceKm: round2(epicentralDistanceKm),
    hypocentralDistanceKm: round2(hypocentralDistanceKm),
    groundMotionIndex: round2(groundMotionIndex),
    mmiNumeric: round2(mmiNumeric),
    mmiRoman: getMmiRoman(mmiNumeric),
    intensityLabel: getMmiIntensityLabel(mmiNumeric),
  };

  const waveTimeline = computeWaveTimeline(epicentralDistanceKm, input.depthKm, input.magnitude);
  const buildingImpact = assessBuildingImpact(
    targetSummary.mmiNumeric,
    waveTimeline.durationSec,
    input.buildingProfileCode,
  );
  const risk = classifyRisk(targetSummary.mmiNumeric, buildingImpact);
  const impactGrid = buildImpactGrid({
    epicenter: input.epicenter,
    magnitude: input.magnitude,
    depthKm: input.depthKm,
    siteFactor: input.siteFactor,
    buildingProfileCode: input.buildingProfileCode,
    stepKm: input.gridStepKm,
    radiusKm: input.gridRadiusKm,
  });

  const targetCell =
    findClosestImpactCell(impactGrid.cells, input.target) ??
    buildTargetCellSummary(targetSummary, input.buildingProfileCode);

  return {
    target: targetSummary,
    waveTimeline,
    buildingImpact,
    risk,
    impactGrid,
    targetCell,
    pedagogicalNotes: buildPedagogicalNotes(targetSummary, waveTimeline.durationSec, input.mode),
  };
}
