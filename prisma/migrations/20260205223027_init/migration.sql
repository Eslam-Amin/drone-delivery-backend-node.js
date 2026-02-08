-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENDUSER', 'DRONE');

-- CreateEnum
CREATE TYPE "DroneStatus" AS ENUM ('IDLE', 'DELIVERING', 'BROKEN', 'RETURNING');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drone" (
    "id" SERIAL NOT NULL,
    "battery" INTEGER NOT NULL DEFAULT 100,
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "DroneStatus" NOT NULL DEFAULT 'IDLE',

    CONSTRAINT "Drone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "userId" INTEGER NOT NULL,
    "droneId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Order_droneId_key" ON "Order"("droneId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
