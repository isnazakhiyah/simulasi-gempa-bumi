export interface GeoPoint {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function computeEpicentralDistance(epicenter: GeoPoint, target: GeoPoint): number {
  const dLat = toRadians(target.lat - epicenter.lat);
  const dLon = toRadians(target.lon - epicenter.lon);
  const lat1 = toRadians(epicenter.lat);
  const lat2 = toRadians(target.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function computeHypocentralDistance(epicentralKm: number, depthKm: number): number {
  return Math.sqrt(epicentralKm * epicentralKm + depthKm * depthKm);
}
