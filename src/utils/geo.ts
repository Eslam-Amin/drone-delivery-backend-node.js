export type Point = {
  lat: number;
  lng: number;
};

export function parseLatLng(value: string): Point {
  const [lat, lng] = value.split(",").map(Number);
  return { lat: lat!, lng: lng! };
}
