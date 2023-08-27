import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { ResponseModel } from '../models/utility/ResponseModel';
import logger from '../utils/logger.util';

const log = logger.getLogger();

/**
 * This functions as sort of an error handling middleware.
 * It is intended to mimic exception filters in NestJS hence the choice in nomenclature.
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
const AllExceptionsFilter = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle custom AppError
  if (err instanceof AppError) {
    const { statusCode, status, message } = err;
    return res.status(statusCode).json({
      status,
      message,
    });
  }

  if (err instanceof ResponseModel) {
    const { statusCode, message } = err;
    return res.status(statusCode).json({
      statusCode,
      message,
    });
  }

  console.error(err);

  // Handle unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

export default AllExceptionsFilter;
