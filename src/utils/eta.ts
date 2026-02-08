import { distanceKm, Point } from "./geo";

export function etaMinutes(from: Point, to: Point, drone_speed = 30): number {
  const km = distanceKm(from, to);
  const hours = km / drone_speed;
  return Math.ceil(hours * 60);
}
