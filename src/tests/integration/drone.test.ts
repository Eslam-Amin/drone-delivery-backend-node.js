import request from "supertest";
import app from "../../app";
import prisma, { resetDB, disconnectDB } from "../helpers/reset-db";
import { signToken } from "../../utils/jwt";

beforeEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("Drone Operations (V1)", () => {
  const setupDrone = async () => {
    const drone = await prisma.drone.create({
      data: { battery: 100, lat: 0, lng: 0, status: "IDLE" }
    });
    // Create a token representing this drone
    const token = signToken({ id: drone.id, role: "DRONE" });
    return { drone, token };
  };

  it("should update heartbeat (lat, lng, battery)", async () => {
    const { drone, token } = await setupDrone();

    const res = await request(app)
      .post("/api/v1/drones/heartbeat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        droneId: drone.id,
        lat: 50.123,
        lng: 30.456,
        battery: 85,
        speed: 40
      });

    expect(res.statusCode).toEqual(200);

    // Verify DB update
    const updated = await prisma.drone.findUnique({ where: { id: drone.id } });
    expect(updated?.lat).toEqual(50.123);
    expect(updated?.battery).toEqual(85);
    expect(updated?.speed).toEqual(40);
  });

  it("CRITICAL: should rescue order when drone breaks", async () => {
    // 1. Arrange: A drone carrying an order
    const { drone, token } = await setupDrone();

    // Create a User to own the order
    const user = await prisma.user.create({
      data: { username: "customer", role: "ENDUSER" }
    });

    // Create an Order assigned to the Drone
    const order = await prisma.order.create({
      data: {
        origin: "Warehouse A",
        destination: "Customer Home",
        status: "IN_PROGRESS", // or IN_TRANSIT depending on your Enum
        userId: user.id,
        droneId: drone.id
      }
    });

    // Move the drone to a "breakdown" location
    await prisma.drone.update({
      where: { id: drone.id },
      data: { lat: 88.88, lng: 99.99 }
    });

    // 2. Act: Report Broken
    const res = await request(app)
      .post("/api/v1/drones/broken")
      .set("Authorization", `Bearer ${token}`)
      .send({ droneId: drone.id });

    // 3. Assert
    expect(res.statusCode).toEqual(200);

    // Check Drone Status
    const brokenDrone = await prisma.drone.findUnique({
      where: { id: drone.id }
    });
    expect(brokenDrone?.status).toEqual("BROKEN");

    // Check Order Status (The Rescue)
    const rescuedOrder = await prisma.order.findUnique({
      where: { id: order.id }
    });

    expect(rescuedOrder?.status).toEqual("PENDING"); // Should be pending for pickup
    expect(rescuedOrder?.droneId).toBeNull(); // Unassigned
    expect(rescuedOrder?.origin).toEqual("88.88,99.99"); // Origin is now the breakdown site
  });
});
