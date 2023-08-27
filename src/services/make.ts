import { Request, Response } from 'express';
import { ResponseModel } from '../models/utility/ResponseModel';

const { default: logger } = require('../utils/logger.util');
const { Redirect } = require('../utils/redirect');

module.exports =
  (controller: any) => async (request: Request, response: Response) => {
    try {
      const data: ResponseModel<any> | typeof Redirect = await controller(
        request,
        response
      );

      if (!data) {
        return;
      }
      if (data instanceof Redirect) {
        return response.redirect(data.route);
      }

      // if (data instanceof ResponseModel && data.data == null) {
      //   const error = data;
      // }
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
