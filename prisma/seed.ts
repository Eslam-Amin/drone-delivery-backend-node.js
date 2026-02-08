import { DroneStatus, OrderStatus, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { prisma } from "../src/config/database";

function randomPoint() {
  return `${faker.location.latitude()},${faker.location.longitude()}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // --- USERS (50) ---
  const users = await Promise.all(
    Array.from({ length: 50 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          role: UserRole.ENDUSER
        }
      })
    )
  );

  // --- ADMIN (10) ---
  await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          role: UserRole.ADMIN
        }
      })
    )
  );

  // --- DRONES (100) ---
  const drones = await Promise.all(
    Array.from({ length: 100 }).map(() =>
      prisma.drone.create({
        data: {
          battery: faker.number.int({ min: 20, max: 100 }),
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
          speed: faker.number.float({ min: 30, max: 60 }),
          status: DroneStatus.IDLE
        }
      })
    )
  );

  // --- ORDERS (500) ---
  const orders = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.order.create({
        data: {
          origin: randomPoint(),
          destination: randomPoint(),
          status: OrderStatus.PENDING,
          onTheWay: false,
          userId: faker.helpers.arrayElement(users).id
        }
      })
    )
  );

  // --- ASSIGN ORDERS TO RANDOM DRONES ---
  const shuffledDrones = faker.helpers.shuffle(drones);
  const activeOrders = faker.helpers
    .shuffle(orders)
    .slice(0, shuffledDrones.length);

  for (let i = 0; i < activeOrders.length; i++) {
    const order = activeOrders[i]!;
    const drone = shuffledDrones[i]!;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PICKED_UP,
          onTheWay: true,
          droneId: drone.id
        }
      }),
      prisma.drone.update({
        where: { id: drone.id },
        data: {
          status: DroneStatus.DELIVERING,
          currentOrder: { connect: { id: order.id } }
        }
      })
    ]);
  }

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
