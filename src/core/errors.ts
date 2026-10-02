export type ErrorDetails = unknown;

export class AppException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  public constructor(code: string, message: string, statusCode = 500, details?: ErrorDetails) {
    super(message);
    this.name = 'AppException';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, AppException);
  }
}

export class ValidationException extends AppException {
  public constructor(message = 'Validation failed.', details?: ErrorDetails) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedException extends AppException {
  public constructor(message = 'Authentication required.') { super('UNAUTHORIZED', message, 401); }
}

export class ForbiddenException extends AppException {
  public constructor(message = 'Access denied.') { super('FORBIDDEN', message, 403); }
}

export class NotFoundException extends AppException {
  public constructor(code: string, message: string) { super(code, message, 404); }
}

export class ConflictException extends AppException {
  public constructor(code: string, message: string) { super(code, message, 409); }
}

export function isAppException(error: unknown): error is AppException {
  return error instanceof AppException;
}