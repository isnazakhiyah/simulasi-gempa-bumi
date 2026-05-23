import type {
  BuildingDamageClass,
  BuildingImpactAssessment,
  RiskAssessment,
  RiskLevel,
} from '@simulasi-gempa/shared-types';

const damageScoreMap: Record<BuildingDamageClass, number> = {
  negligible: 1,
  light: 2,
  moderate: 3,
  heavy: 4,
  severe: 4.5,
  collapse_prone: 5,
};

function formatDamageLabel(damageClass: BuildingDamageClass) {
  return damageClass.replace(/_/g, ' ');
}

export function classifyRisk(mmi: number, buildingDamage: BuildingImpactAssessment): RiskAssessment {
  const damageScore = damageScoreMap[buildingDamage.damageClass];
  const collapseScore =
    buildingDamage.collapseRisk === 'low'
      ? 0
      : buildingDamage.collapseRisk === 'moderate'
        ? 0.8
        : buildingDamage.collapseRisk === 'high'
          ? 1.5
          : 2.2;

  const score = Number((mmi * 0.72 + damageScore * 0.9 + collapseScore).toFixed(2));

  let level: RiskLevel;
  if (score < 5) {
    level = 'low';
  } else if (score < 7) {
    level = 'medium';
  } else if (score < 8.8) {
    level = 'high';
  } else {
    level = 'extreme';
  }

  const factors = [
    `Intensitas target sekitar MMI ${mmi.toFixed(1)}.`,
    `Prediksi damage bangunan: ${formatDamageLabel(buildingDamage.damageClass)}.`,
    `Perkiraan drift ratio sekitar ${buildingDamage.driftRatioEstimate.toFixed(2)}%.`,
  ];

  const summaryMap: Record<RiskLevel, string> = {
    low: 'Risiko relatif rendah untuk skenario pembelajaran ini, tetapi pengamatan efek lokal tetap penting.',
    medium: 'Risiko menengah; siswa dapat membahas bagaimana perubahan kecil parameter memengaruhi kerusakan.',
    high: 'Risiko tinggi; skenario ini cocok untuk membahas prioritas mitigasi dan ketahanan struktur.',
    extreme: 'Risiko ekstrem; gunakan skenario ini untuk menekankan pentingnya desain tahan gempa dan kesiapsiagaan.',
  };

  return {
    level,
    score,
    summary: summaryMap[level],
    factors,
  };
}
