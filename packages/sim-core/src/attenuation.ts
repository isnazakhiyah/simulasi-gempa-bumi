export interface GroundMotionIndexParams {
  magnitude: number;
  hypocentralDistanceKm: number;
  depthKm: number;
  siteFactor: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function computeGroundMotionIndex({
  magnitude,
  hypocentralDistanceKm,
  depthKm,
  siteFactor,
}: GroundMotionIndexParams): number {
  const magnitudeTerm = 0.92 * magnitude;
  const distanceTerm = 1.25 * Math.log10(hypocentralDistanceKm + 1);
  const depthTerm = 0.0018 * depthKm;
  const siteTerm = 0.55 * siteFactor;
  const calibrationTerm = 0.25;

  const value = magnitudeTerm - distanceTerm - depthTerm + siteTerm + calibrationTerm;
  return clamp(value, 0, 10);
}
