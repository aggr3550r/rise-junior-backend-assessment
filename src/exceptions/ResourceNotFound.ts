import { HttpStatus } from '../enums/http-status.enum';

export class ResourceNotFoundException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'Could not find a result matching that identifier!';
    status = status || HttpStatus.NOT_FOUND;
    super(message);
  }
}
