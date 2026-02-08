import app from "../../app";
import Request from "supertest";
import prisma, { resetDB, disconnectDB } from "../helpers/reset-db";

// Jest Lifecycle Hooks
beforeEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("Auth API (V1)", () => {
  it("should return a token for valid admin credentials", async () => {
    // 1. Arrange: Seed a user
    // Note: In a real app, hash the password. For this test, we assume service handles comparison.
    const creatdUser = await prisma.user.create({
      data: {
        username: "admin_user",
        role: "ADMIN"
      }
    });

    // 2. Act
    const res = await Request(app).post("/api/v1/auth/token").send({
      name: "admin_user",
      role: "ADMIN",
      id: creatdUser.id
    });

    // 3. Assert
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should return 400 for missing fields", async () => {
    const res = await Request(app).post("/api/v1/auth/token").send({
      // missing name/role
    });

    expect(res.statusCode).toEqual(400);
  });
});
