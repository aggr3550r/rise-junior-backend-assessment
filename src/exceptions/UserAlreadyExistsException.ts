import { HttpStatus } from '../enums/http-status.enum';
import { ResourceAlreadyExistsException } from './ResourceAlreadyExistsException';

export class UserAlreadyExistsException extends ResourceAlreadyExistsException {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'An account already exists with that email address!';
    super(message, status);
  }
}
