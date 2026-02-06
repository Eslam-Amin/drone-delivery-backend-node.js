import { DroneStatus, Role } from "@prisma/client";
import { prisma } from "../src/config/database";

async function main() {
  // 1. Create a Admin
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      role: Role.ADMIN
    }
  });

  // 2. Create a Dummy User
  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      role: Role.ENDUSER
    }
  });

  // 2. Create a Dummy Drone
  const drone = await prisma.drone.create({
    data: {
      battery: 100,
      lat: 0.0,
      lng: 0.0,
      status: DroneStatus.IDLE
    }
  });

  console.log({ admin, user, drone });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
