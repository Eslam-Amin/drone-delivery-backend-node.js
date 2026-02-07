export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors?: any[];

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // --- Static Factory Methods ---

  static BadRequest(message: string = "Bad Request", errors: any[] = []) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  static Forbidden(message: string = "Forbidden") {
    return new ApiError(403, message);
  }

  static NotFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  static Internal(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}
