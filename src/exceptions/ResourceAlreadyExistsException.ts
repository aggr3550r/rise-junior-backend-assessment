import { HttpStatus } from '../enums/http-status.enum';

export class ResourceAlreadyExistsException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'Resource already exists!';
    status = status || HttpStatus.CONFLICT;
    super(message);
  }
}
