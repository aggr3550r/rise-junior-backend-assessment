import { Request, Response } from 'express';
import { ResponseModel } from '../models/utility/ResponseModel';
import { User } from '../modules/user/entities/user.entity';

const { default: logger } = require('../utils/logger.util');
const { Redirect } = require('../utils/redirect');

module.exports =
  (controller: any) => async (request: Request, response: Response) => {
    try {
      let data: ResponseModel<any> | typeof Redirect = await controller(
        request,
        response
      );

      if (!data) {
        return;
      }
      if (data instanceof Redirect) {
        return response.redirect(data.route);
      }

      /**
       * This serves as a makeshift interceptor that sanitizes sensitive user credential out of output where necessary.
       */
      if (data instanceof ResponseModel && data.data instanceof User) {
        const sanitizedUser = data.data;

        delete sanitizedUser.password;

        response.status(data.statusCode).json({
          statusCode: data.statusCode,
          message: data.message,
          data: sanitizedUser,
        });
      }

      response.status(data.statusCode).json({
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
      });
    } catch (e) {
      const log = logger.getLogger();

      response.locals.message = e.message;
      response.locals.error = e;

      const status = e?.statusCode || e?.status || 500;

      log.error(
        `${status} - ${e.message} - ${request.originalUrl} - ${request.method} - ${request.ip}`,
        e
      );

      return response.status(status).send({ message: e.message });
    }
  };
