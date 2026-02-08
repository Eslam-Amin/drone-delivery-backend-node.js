import Request from "supertest";
import app from "../../app";
import prisma, { resetDB, disconnectDB } from "../helpers/reset-db";
import { signToken } from "../../utils/jwt";

beforeEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("Order Operations (V1)", () => {
  const setupUser = async () => {
    const user = await prisma.user.create({
      data: { username: "buyer", role: "ENDUSER" }
    });
    const token = signToken({ id: user.id, role: "ENDUSER" });
    return { user, token };
  };

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
    expect(res.body.data).toEqual([order]);
  });
});
