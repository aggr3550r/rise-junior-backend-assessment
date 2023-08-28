import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import * as JWT from 'jsonwebtoken';
import { AppError } from '../exceptions/AppError';
import { ResourceNotFoundException } from '../exceptions/ResourceNotFound';
import { User } from '../modules/user/entities/user.entity';
import logger from './logger.util';
import { JWTException } from '../exceptions/JWTException';

const scrypt = promisify(_scrypt);
const log = logger.getLogger();

export default class SecurityUtil {
  static async generateTokenWithSecret(user: User): Promise<string> {
    const { id, role } = user;
    return JWT.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static async verifyTokenWithSecret(token: any, secretKey: string) {
    try {
      const decoded = JWT.verify(token, secretKey);
      return decoded;
    } catch (error) {
      console.error('verifyTokenWithSecret error()');
      throw new JWTException(error.message.toString().toLocaleUpperCase());
    }
  }

  static async encryptPassword(password: string) {
    try {
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(password, salt, 32)) as Buffer;
      const encryptedPassword = salt.concat('.', hash.toString('hex'));

      return encryptedPassword;
    } catch (error) {
      console.log('An error occured while encrypting this password.');
      console.log(error);
    }
  }

  static async decryptAndVerifyPassword(clientPassword: string, user: User) {
    try {
      const userPassword = user?.password;

      if (!userPassword)
        throw new ResourceNotFoundException(
          'Could not find password for that user'
        );

      const [salt, storedHash] = userPassword.split('.');

      const hash = (await scrypt(clientPassword, salt, 32)) as Buffer;

      if (storedHash === hash.toString('hex')) {
        return user;
      } else {
        throw new AppError('Password Incorrect', 400);
      }
    } catch (error) {
      log.error('decryptAndVerifyPassword() error \n %o', error);

      throw new AppError(
        error?.message || 'Error occured while trying to verify that password',
        error?.statusCode || 400
      );
    }
  }
}
