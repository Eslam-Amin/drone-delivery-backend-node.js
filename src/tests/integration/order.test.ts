import Request from "supertest";
import app from "../../app";
import prisma, { resetDB, disconnectDB } from "../helpers/reset-db";
import {
  createOrder,
  setupAdmin,
  setupDrone,
  setupUser
} from "../helpers/setup";

beforeEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("Order Operations (V1)", () => {
  it("should create a valid order", async () => {
    const { token } = await setupUser();

    const res = await Request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "51.00,53.00",
        destination: "55.00,56.00"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.origin).toEqual("51.00,53.00");
  });

  it("should reject invalid order data (Zod Validation)", async () => {
    const { token } = await setupUser();

    const res = await Request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "50.00,53.00"
        // Missing Destination
      });

    expect(res.statusCode).toEqual(400); // Bad Request
  });

  it("should list all user's orders", async () => {
    const { user, token } = await setupUser();
    const order = await prisma.order.create({
      data: {
        origin: "51.00,53.00",
        destination: "55.00,56.00",
        userId: user.id
      }
    });

    const res = await Request(app)
      .get("/api/v1/orders/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expect(res.body.data[0].id).toEqual(order.id);
  });

  it("should update an order", async () => {
    const { token } = await setupAdmin();
    const { user } = await setupUser();
    const order = await createOrder("51.00,53.00", "55.00,56.00", user.id);

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "70.00,73.00",
        destination: "74.00,75.00"
      });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id }
    });

    expect(res.statusCode).toEqual(200);
    expect(updatedOrder?.origin).toEqual("70.00,73.00");
    expect(updatedOrder?.destination).toEqual("74.00,75.00");
  });

  it("shouldn't update an order with invalid data", async () => {
    const { token } = await setupAdmin();
    const { user } = await setupUser();
    const order = await createOrder("51.00,53.00", "55.00,56.00", user.id);

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "City 1"
      });

    expect(res.statusCode).toEqual(400); // Bad Request
  });

  it("shouldn't update an order with invalid role", async () => {
    const { user, token } = await setupUser();
    const order = await createOrder("51.00,53.00", "55.00,56.00", user.id);

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        origin: "70.00,73.00"
      });

    expect(res.statusCode).toEqual(403); // Forbidden
  });

  it("should withdraw an order", async () => {
    const { user, token } = await setupUser();
    const order = await createOrder("51.00,53.00", "55.00,56.00", user.id);

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.statusCode).toEqual(200);
  });

  it("should not withdraw an order of another user", async () => {
    const { token } = await setupUser("user 1");
    const { user: anotherUser } = await setupUser("another user");
    const order = await createOrder(
      "51.00,53.00",
      "55.00,56.00",
      anotherUser.id
    );

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.statusCode).toEqual(401);
  });

  it("shouldn't withdraw an order that is in progress", async () => {
    const { user, token } = await setupUser();
    const { drone } = await setupDrone();

    const order = await createOrder("51.00,53.00", "55.00,56.00", user.id);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "IN_PROGRESS", droneId: drone.id }
    });

    const res = await Request(app)
      .patch(`/api/v1/orders/${order.id}/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toEqual(400);
  });
});
