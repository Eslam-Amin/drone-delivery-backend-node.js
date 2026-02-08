import { Drone, Order } from "@prisma/client";
import { distanceKm, parseLatLng, Point } from "./geo";

export function etaMinutes(from: Point, to: Point, drone_speed = 30): number {
  const km = distanceKm(from, to);
  const hours = km / drone_speed;
  return Math.ceil(hours * 60);
}

export function computeEta(order: Order & { drone?: Drone | null }) {
  if (!order.drone) return null;

  return etaMinutes(
    { lat: order.drone.lat, lng: order.drone.lng },
    parseLatLng(order.destination),
    order.drone.speed ?? 30
  );
}
