export type Point = {
  lat: number;
  lng: number;
};

export function parseLatLng(value: string): Point {
  const [lat, lng] = value.split(",").map(Number);
  return { lat: lat!, lng: lng! };
}

export function distanceKm(a: Point, b: Point): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);

  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
