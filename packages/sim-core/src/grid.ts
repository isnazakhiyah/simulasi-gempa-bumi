import type {
  BuildingProfileCode,
  ImpactCellSummary,
  ImpactGridSummary,
  SimulationTargetSummary,
} from '@simulasi-gempa/shared-types';
import { computeGroundMotionIndex } from './attenuation.js';
import { assessBuildingImpact } from './buildings.js';
import { computeEpicentralDistance, computeHypocentralDistance, type GeoPoint } from './distance.js';
import { convertGroundMotionToMMI, classifyImpactSeverity, getMmiIntensityLabel, getMmiRoman } from './mmi.js';
import { classifyRisk } from './risk.js';

export interface BuildImpactGridInput {
  epicenter: GeoPoint;
  magnitude: number;
  depthKm: number;
  siteFactor: number;
  buildingProfileCode: BuildingProfileCode;
  radiusKm?: number;
  stepKm?: number;
}

function kmToLatDegrees(km: number) {
  return km / 110.574;
}

function kmToLonDegrees(km: number, latitude: number) {
  const latitudeCos = Math.max(0.2, Math.cos((latitude * Math.PI) / 180));
  return km / (111.32 * latitudeCos);
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function buildCellSummary(
  point: GeoPoint,
  epicenter: GeoPoint,
  magnitude: number,
  depthKm: number,
  siteFactor: number,
  buildingProfileCode: BuildingProfileCode,
  id: string,
): ImpactCellSummary {
  const epicentralDistanceKm = computeEpicentralDistance(epicenter, point);
  const hypocentralDistanceKm = computeHypocentralDistance(epicentralDistanceKm, depthKm);
  const groundMotionIndex = computeGroundMotionIndex({
    magnitude,
    hypocentralDistanceKm,
    depthKm,
    siteFactor,
  });
  const mmiNumeric = convertGroundMotionToMMI(groundMotionIndex);
  const buildingImpact = assessBuildingImpact(mmiNumeric, 12, buildingProfileCode);
  const risk = classifyRisk(mmiNumeric, buildingImpact);

  return {
    id,
    lat: round4(point.lat),
    lon: round4(point.lon),
    epicentralDistanceKm: round2(epicentralDistanceKm),
    hypocentralDistanceKm: round2(hypocentralDistanceKm),
    groundMotionIndex: round2(groundMotionIndex),
    mmiNumeric: round2(mmiNumeric),
    mmiRoman: getMmiRoman(mmiNumeric),
    intensityLabel: getMmiIntensityLabel(mmiNumeric),
    impactClass: classifyImpactSeverity(mmiNumeric),
    damageClass: buildingImpact.damageClass,
    riskLevel: risk.level,
  };
}

export function buildImpactGrid({
  epicenter,
  magnitude,
  depthKm,
  siteFactor,
  buildingProfileCode,
  radiusKm = Math.max(30, Math.min(70, magnitude * 10)),
  stepKm = 5,
}: BuildImpactGridInput): ImpactGridSummary {
  const cells: ImpactCellSummary[] = [];

  for (let northSouthKm = -radiusKm; northSouthKm <= radiusKm; northSouthKm += stepKm) {
    for (let eastWestKm = -radiusKm; eastWestKm <= radiusKm; eastWestKm += stepKm) {
      const cellLat = epicenter.lat + kmToLatDegrees(northSouthKm);
      const cellLon = epicenter.lon + kmToLonDegrees(eastWestKm, epicenter.lat);
      const point = { lat: cellLat, lon: cellLon };
      const epicentralDistanceKm = computeEpicentralDistance(epicenter, point);

      if (epicentralDistanceKm > radiusKm) {
        continue;
      }

      const cellId = `cell-${northSouthKm}-${eastWestKm}`;
      cells.push(
        buildCellSummary(
          point,
          epicenter,
          magnitude,
          depthKm,
          siteFactor,
          buildingProfileCode,
          cellId,
        ),
      );
    }
  }

  return {
    radiusKm: round2(radiusKm),
    stepKm: round2(stepKm),
    cells,
  };
}

export function buildTargetCellSummary(
  target: SimulationTargetSummary,
  buildingProfileCode: BuildingProfileCode,
): ImpactCellSummary {
  const buildingImpact = assessBuildingImpact(target.mmiNumeric, 12, buildingProfileCode);
  const risk = classifyRisk(target.mmiNumeric, buildingImpact);

  return {
    id: 'target-focus',
    lat: target.lat,
    lon: target.lon,
    epicentralDistanceKm: target.epicentralDistanceKm,
    hypocentralDistanceKm: target.hypocentralDistanceKm,
    groundMotionIndex: target.groundMotionIndex,
    mmiNumeric: target.mmiNumeric,
    mmiRoman: target.mmiRoman,
    intensityLabel: target.intensityLabel,
    impactClass: classifyImpactSeverity(target.mmiNumeric),
    damageClass: buildingImpact.damageClass,
    riskLevel: risk.level,
  };
}

export function findClosestImpactCell(cells: ImpactCellSummary[], target: GeoPoint) {
  return cells.reduce<ImpactCellSummary | null>((closest, cell) => {
    if (!closest) {
      return cell;
    }

    const currentDistance = computeEpicentralDistance(target, { lat: cell.lat, lon: cell.lon });
    const closestDistance = computeEpicentralDistance(target, { lat: closest.lat, lon: closest.lon });
    return currentDistance < closestDistance ? cell : closest;
  }, null);
}
