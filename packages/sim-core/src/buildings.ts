import type {
  BuildingDamageClass,
  BuildingImpactAssessment,
  BuildingProfileCode,
  CollapseRiskLevel,
} from '@simulasi-gempa/shared-types';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getNonReinforcedMasonryDamageClass(mmi: number): BuildingDamageClass {
  if (mmi < 6) return 'negligible';
  if (mmi < 7) return 'light';
  if (mmi < 8) return 'moderate';
  if (mmi < 9) return 'heavy';
  return 'collapse_prone';
}

function getSimpleReinforcedConcreteDamageClass(mmi: number): BuildingDamageClass {
  if (mmi < 6) return 'negligible';
  if (mmi < 7) return 'negligible';
  if (mmi < 8) return 'light';
  if (mmi < 9) return 'moderate';
  return 'severe';
}

function getCollapseRisk(damageClass: BuildingDamageClass): CollapseRiskLevel {
  switch (damageClass) {
    case 'negligible':
      return 'low';
    case 'light':
      return 'moderate';
    case 'moderate':
      return 'moderate';
    case 'heavy':
      return 'high';
    case 'severe':
      return 'high';
    case 'collapse_prone':
      return 'very_high';
    default:
      return 'moderate';
  }
}

function getBaseDriftRatio(damageClass: BuildingDamageClass) {
  switch (damageClass) {
    case 'negligible':
      return 0.2;
    case 'light':
      return 0.55;
    case 'moderate':
      return 1.2;
    case 'heavy':
      return 2.4;
    case 'severe':
      return 3.2;
    case 'collapse_prone':
      return 4.8;
    default:
      return 1;
  }
}

function buildExplanation(
  buildingProfile: BuildingProfileCode,
  damageClass: BuildingDamageClass,
  mmi: number,
  durationSec: number,
) {
  const profileLabel =
    buildingProfile === 'non_reinforced_masonry'
      ? 'bangunan pasangan bata tanpa tulangan'
      : 'bangunan beton bertulang sederhana';

  const damageLabelMap: Record<BuildingDamageClass, string> = {
    negligible: 'respons struktur cenderung kecil',
    light: 'kerusakan ringan mulai mungkin muncul',
    moderate: 'retak dan gangguan non-struktural menjadi signifikan',
    heavy: 'elemen struktural mulai mengalami kerusakan berat',
    severe: 'struktur berpotensi mengalami kerusakan berat dan kehilangan fungsi',
    collapse_prone: 'struktur sangat rentan menuju keruntuhan parsial atau total',
  };

  return `Pada ${profileLabel}, intensitas sekitar MMI ${mmi.toFixed(1)} dengan durasi guncangan ${durationSec.toFixed(
    1,
  )} detik membuat ${damageLabelMap[damageClass]}. Model ini bersifat pedagogis sehingga dapat dipakai membandingkan skenario secara konsisten di kelas.`;
}

export function assessBuildingImpact(
  mmi: number,
  durationSec: number,
  buildingProfile: BuildingProfileCode,
): BuildingImpactAssessment {
  const damageClass =
    buildingProfile === 'non_reinforced_masonry'
      ? getNonReinforcedMasonryDamageClass(mmi)
      : getSimpleReinforcedConcreteDamageClass(mmi);

  const durationFactor = durationSec > 12 ? (durationSec - 12) * 0.035 : 0;
  const driftRatioEstimate = clamp(getBaseDriftRatio(damageClass) + durationFactor, 0.1, 6.5);
  const collapseRisk = getCollapseRisk(damageClass);

  return {
    buildingProfileCode: buildingProfile,
    damageClass,
    driftRatioEstimate: Number(driftRatioEstimate.toFixed(2)),
    collapseRisk,
    pedagogicalExplanation: buildExplanation(buildingProfile, damageClass, mmi, durationSec),
  };
}
