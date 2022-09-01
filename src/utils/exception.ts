export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}
