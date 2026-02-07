import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { config } from "../config/env.config";

// Extended Error interface to handle dynamic properties from different libraries
interface AppError extends Error {
  statusCode?: number;
  success?: boolean;
  isOperational?: boolean;
  code?: string | number; // For MongoDB (number) & Prisma (string) codes
  keyValue?: Record<string, any>; // For MongoDB duplicate keys
  path?: string; // For Mongoose validation
  value?: any; // For Mongoose cast errors
  errors?: Record<string, { message: string }>; // For Mongoose validation errors
  meta?: Record<string, any>; // For Prisma metadata
}

class ErrorHandler {
  // ----------------------------------------------------------------
  // Development: Send detailed error with stack trace
  // ----------------------------------------------------------------
  private static sendErrorForDev(err: AppError, res: Response): void {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // ----------------------------------------------------------------
  // Production: Send sanitized error (hide internals)
  // ----------------------------------------------------------------
  private static sendErrorForProd(err: AppError, res: Response): void {
    // 1. Trusted operational errors: Send message to client
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message
      });
    }
    // 2. Programming or unknown errors: Don't leak details
    else {
      res.status(500).json({
        success: false,
        message: "Something went wrong"
      });
    }
  }

  // =================================================================
  //  Prisma (SQL) Error Handlers
  // =================================================================

  // Handle Unique Constraint Violation (e.g., duplicate email)
  private static handlePrismaDuplicateKey(
    err: Prisma.PrismaClientKnownRequestError
  ): ApiError {
    const target = (err.meta?.target as string[]) || ["field"];
    const message = `Duplicate field value: ${target.join(", ")}. Please use another value.`;
    return ApiError.BadRequest(message);
  }

  // Handle Record Not Found (e.g., update user that doesn't exist)
  private static handlePrismaNotFound(
    err: Prisma.PrismaClientKnownRequestError
  ): ApiError {
    return ApiError.NotFound(`Record not found. ${err.meta?.cause || ""}`);
  }

  // Handle Foreign Key Violation (e.g., creating order for non-existent user)
  private static handlePrismaForeignKey(
    err: Prisma.PrismaClientKnownRequestError
  ): ApiError {
    const field = err.meta?.field_name || "unknown field";
    return ApiError.BadRequest(`Invalid reference ID at field: ${field}`);
  }

  // =================================================================
  //  Mongoose (NoSQL) Error Handlers
  // =================================================================

  private static handleMongoCastError(err: AppError): ApiError {
    const message = `Invalid ${err.path}: ${err.value}`;
    return ApiError.BadRequest(message);
  }

  private static handleMongoDuplicateFields(err: AppError): ApiError {
    const value = err.keyValue ? Object.values(err.keyValue)[0] : "unknown";
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return ApiError.BadRequest(message);
  }

  private static handleMongoValidationError(err: AppError): ApiError {
    const errors = Object.values(err.errors || {}).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return ApiError.BadRequest(message);
  }

  // =================================================================
  //  JWT Error Handlers
  // =================================================================

  private static handleJWTError(): ApiError {
    return ApiError.Unauthorized(
      "Your token has expired! Please log in again."
    );
  }

  private static handleJWTExpiredError(): ApiError {
    return ApiError.Unauthorized(
      "Your token has expired! Please log in again."
    );
  }

  // =================================================================
  //  Main Handler
  // =================================================================

  public static handle = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    err.statusCode = err.statusCode || 500;
    err.success = err.success || false;

    // In Development, break early and show everything
    if (config.nodeEnv === "development") {
      ErrorHandler.sendErrorForDev(err, res);
      return;
    }

    // In Production, normalize errors
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; // Critical: JS spread doesn't always copy the .name property

    //

    //This logic acts as a router for error types

    // 1. Prisma Error Handling
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002": // Unique constraint failed
          error = ErrorHandler.handlePrismaDuplicateKey(err);
          break;
        case "P2025": // Record not found
          error = ErrorHandler.handlePrismaNotFound(err);
          break;
        case "P2003": // Foreign key constraint failed
          error = ErrorHandler.handlePrismaForeignKey(err);
          break;
        case "P2000": // Value too long for column
          error = ApiError.BadRequest(
            "Input value is too long for the column."
          );
          break;
      }
    }
    // 2. Prisma Validation Error (e.g. missing field in strict mode)
    else if (err instanceof Prisma.PrismaClientValidationError) {
      error = ApiError.BadRequest(
        "Database Validation Error: Check your input types."
      );
    }

    // 3. MongoDB Error Handling
    else if (err.name === "CastError")
      error = ErrorHandler.handleMongoCastError(error);
    else if (err.code === 11000)
      error = ErrorHandler.handleMongoDuplicateFields(error);
    else if (err.name === "ValidationError")
      error = ErrorHandler.handleMongoValidationError(error);
    // 4. JWT Error Handling
    else if (err.name === "JsonWebTokenError")
      error = ErrorHandler.handleJWTError();
    else if (err.name === "TokenExpiredError")
      error = ErrorHandler.handleJWTExpiredError();

    // 5. Send Final Sanitized Response
    ErrorHandler.sendErrorForProd(error, res);
  };
}

export const globalErrorHandler = ErrorHandler.handle;
