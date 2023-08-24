export class AppError extends Error {
  public statusCode: number | string;
  public status: string;

  constructor(message: string, statusCode: string | number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}
