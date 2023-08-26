import { NextFunction } from 'express';

module.exports =
  (...types: any) =>
  async (request: any, response: any, next: NextFunction) => {
    const { accountType } = request.auth;
    if (!types.includes(accountType))
      return response
        .status(401)
        .send('[is-account] You are not authorized to access this route');
    return next();
  };
