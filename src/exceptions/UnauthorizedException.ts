import { HttpStatus } from '../enums/http-status.enum';

export class UnauthorizedException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'User not currently logged in!';
    status = status || HttpStatus.UNAUTHORIZED;
    super(message);
  }
}
