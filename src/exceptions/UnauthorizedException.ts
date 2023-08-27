import { HttpStatus } from '../enums/http-status.enum';

export class UnauthorizedException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'You are not authorized to access that resource!';
    status = status || HttpStatus.UNAUTHORIZED;
    super(message);
  }
}
