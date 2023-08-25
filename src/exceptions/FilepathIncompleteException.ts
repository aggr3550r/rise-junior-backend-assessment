import { HttpStatus } from '../enums/http-status.enum';

export default class FilepathIncompleteException extends Error {
  constructor(message?: string, status?: HttpStatus) {
    message =
      message ||
      'The file path you provided is not complete. Make sure to add the file extension when providing the path.';
    status = status || HttpStatus.UNPROCESSABLE_ENTITY;
    super(message);
  }
}
