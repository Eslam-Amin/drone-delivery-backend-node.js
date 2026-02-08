import { signToken } from "../../utils/jwt";
import prisma from "../helpers/reset-db";

export const setupUser = async (username = "normal user") => {
  const user = await prisma.user.create({
    data: { username, role: "ENDUSER" }
  });
  const token = signToken({ id: user.id, role: "ENDUSER" });
  return { user, token };
};
export const setupAdmin = async () => {
  const admin = await prisma.user.create({
    data: { username: "admin", role: "ADMIN" }
  });
  const token = signToken({ id: admin.id, role: "ADMIN" });
  return { admin, token };
};

export const setupDrone = async () => {
  const drone = await prisma.drone.create({
    data: { battery: 100, lat: 0.0, lng: 0.0, speed: 30.0, status: "IDLE" }
  });
  const token = signToken({ id: drone.id, role: "DRONE" });
  return { drone, token };
};

export const createOrder = async (
  origin: string,
  destination: string,
  userId: number
) => {
  const order = await prisma.order.create({
    data: {
      origin,
      destination,
      userId
    }
  });
  return order;
};
