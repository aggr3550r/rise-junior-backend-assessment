import { NextFunction } from 'express';
import SecurityUtil from '../utils/security.util';
import { getRepository } from 'typeorm';
import { User } from '../modules/user/entities/user.model';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

module.exports = async (req: any, res: any, next: NextFunction) => {
  const userRepo = getRepository(User);

  let token: unknown;
  if (
    req?.headers?.authorization &&
    req?.headers?.authorization.startsWith('Bearer')
  ) {
    token = req?.headers?.authorization.split(' ')[1];
  } else if (req?.cookies?.jwt) {
    token = req?.cookies?.jwt;
  }

  if (!token) {
    throw new UnauthorizedException('User not currently logged in!');
  }

  const payload: any = await SecurityUtil.verifyTokenWithSecret(
    token,
    process.env.JWT_SECRET
  );

  const user = await userRepo.findOneBy({ id: payload['id'] });

  if (!payload)
    return res.status(401).send({
      message:
        '[is-authenticated] 1 You are not authorized to access this resource',
    });

  if (!user)
    return res.status(401).send({
      message:
        '[is-authenticated] 2 You are not authorized to access this resource',
    });
  req.auth = payload;
  req.user = payload;
  return next();
};
