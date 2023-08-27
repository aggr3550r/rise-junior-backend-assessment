import { NextFunction } from 'express';
import { UserRole } from '../enums/user-role.enum';

module.exports =
  (...types: UserRole[]) =>
  async (request: any, response: any, next: NextFunction) => {
    const { role } = request.auth;
    if (!types.includes(role))
      return response
        .status(401)
        .send('[is-account] You are not authorized to access this route');
    return next();
  };
