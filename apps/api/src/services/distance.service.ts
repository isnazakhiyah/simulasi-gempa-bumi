export function computeEpicentralDistanceKm(
  epicenterLat: number,
  epicenterLon: number,
  targetLat: number,
  targetLon: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(targetLat - epicenterLat);
  const dLon = toRadians(targetLon - epicenterLon);

  const lat1 = toRadians(epicenterLat);
  const lat2 = toRadians(targetLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return Number(distance.toFixed(3));
}