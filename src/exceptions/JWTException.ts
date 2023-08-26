import { HttpStatus } from '../enums/http-status.enum';

export class JWTException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'An error occured while trying to process the JWT.';
    status = status || HttpStatus.BAD_REQUEST;
    super(message);
  }
}
