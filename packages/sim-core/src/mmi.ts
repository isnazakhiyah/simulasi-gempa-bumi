import type { ImpactSeverityClass, MmiRoman } from '@simulasi-gempa/shared-types';

const MMI_ROMAN_BY_INDEX: MmiRoman[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function convertGroundMotionToMMI(gmi: number): number {
  return clamp(1.15 * gmi + 1.2, 1, 10);
}

export function getMmiRoman(mmi: number): MmiRoman {
  const index = clamp(Math.round(mmi), 1, 10) - 1;
  return MMI_ROMAN_BY_INDEX[index];
}

export function getMmiIntensityLabel(mmi: number): string {
  if (mmi < 2) return 'Tidak terasa';
  if (mmi < 3) return 'Sangat lemah';
  if (mmi < 4) return 'Lemah';
  if (mmi < 5) return 'Ringan';
  if (mmi < 6) return 'Cukup kuat';
  if (mmi < 7) return 'Kuat';
  if (mmi < 8) return 'Sangat kuat';
  if (mmi < 9) return 'Merusak';
  return 'Sangat merusak';
}

export function classifyImpactSeverity(mmi: number): ImpactSeverityClass {
  if (mmi < 6) {
    return 'light';
  }

  if (mmi < 7.5) {
    return 'moderate';
  }

  return 'heavy';
}
