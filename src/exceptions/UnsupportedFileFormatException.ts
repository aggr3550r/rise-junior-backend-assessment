import { HttpStatus } from '../enums/http-status.enum';

export default class UnsupportedFileFormatException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message = message || 'This file format is unsupported';
    status = status || HttpStatus.UNSUPPORTED_MEDIA_TYPE;
    super(message);
  }
}
