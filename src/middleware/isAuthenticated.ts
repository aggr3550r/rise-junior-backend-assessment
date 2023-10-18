import { NextFunction } from 'express';
import SecurityUtil from '../utils/security.util';
import { getRepository } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import { HttpStatus } from '../enums/http-status.enum';

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
    return res.status(401).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'User not currently logged in!',
      data: null,
    });
  }

  console.info('MIDDLEWARE LOG', token);

  const payload: any = await SecurityUtil.verifyTokenWithSecret(
    token,
    process.env.JWT_SECRET
  );

  console.info('MIDDLEWARE LOG', payload);

  if (!payload.data)
    return res.status(401).json({
      statusCode: 401,
      message:
        payload.message ||
        '[is-authenticated] 1 You are not authorized to access this resource',
      data: null,
    });

  const user = await userRepo.findOne({
    where: {
      id: payload.data['id'],
    },
  });

  console.info('NA ME BE USER \n %o', user);

  if (!user)
    return res.status(401).send({
      message:
        '[is-authenticated] 2 You are not authorized to access this resource',
    });
  req.auth = payload.data;
  req.user = payload.data;
  return next();
};
