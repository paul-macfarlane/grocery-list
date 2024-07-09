export class ApplicationError extends Error {
  constructor(message: string, code?: number) {
    super(message);
    this.name = "ApplicationError";
    this.code = code ?? 500;
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  code: number;
}

export class NotFoundError extends ApplicationError {
  constructor(resourceName: string, message?: string) {
    super(message ?? `${resourceName} not found`, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? "resource conflict", 409);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
