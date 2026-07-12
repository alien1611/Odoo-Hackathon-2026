export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    
    // Capture the stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}