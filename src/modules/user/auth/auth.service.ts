import { Response } from 'express';
import SecurityUtil from '../../../utils/security.util';
import { User } from '../entities/user.model';
import { UserService } from '../user.service';
import { RiseVestStatusMsg } from '../../../enums/rise-response.enum';
import logger from '../../../utils/logger.util';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { AppError } from '../../../exceptions/AppError';
import { LoginDTO } from '../dtos/login-dto';
import { ResourceNotFoundException } from '../../../exceptions/ResourceNotFound';
import { ResponseModel } from '../../../models/utility/ResponseModel';
import { HttpStatus } from '../../../enums/http-status.enum';

const log = logger.getLogger();

export class AuthService {
  constructor(private userService: UserService) {}

  /**
   * This method creates a JWT token to be sent to the client which it will use to make subsequent requests to protected routes.
   * @param user
   * @param statusCode
   * @param res
   */
  async createAndSendAuthToken(user: User, statusCode: number, res: Response) {
    try {
      const token = await SecurityUtil.generateTokenWithSecretAndId(user.id);

      const cookieOptions: any = {
        expires: new Date(
          Date.now() +
            (Number(process.env.JWT_COOKIE_EXPIRES_IN) ?? 24) *
              24 *
              60 *
              60 *
              1000
        ),
        httpOnly: true,
      };
      if (process.env.NODE_ENV === 'production' || 'prod' || 'prd')
        cookieOptions['secure'] = true;

      res.cookie('jwt', token, cookieOptions);

      // Remove password from output
      user.password = undefined;

      log.info(token);

      // res.status(statusCode).json({
      //   status: RiseVestStatusMsg.SUCCESS,
      //   token,
      //   data: {
      //     user,
      //   },
      // });

      return new ResponseModel(HttpStatus.OK, 'User successfully logged in', {
        token,
        data: {
          user,
        },
      });
    } catch (error) {
      log.error('createAndSendAuthToken() error', error);
      throw new AppError(
        error?.message || 'Could not complete user signup.',
        error?.status || 400
      );
    }
  }

  async signup(data: CreateUserDTO) {
    try {
      let { email, password } = data;
      password = await SecurityUtil.encryptPassword(password);

      const userData: CreateUserDTO = {
        email,
        password,
      };

      return await this.userService.createUser(userData);
    } catch (error) {
      log.error('signup() error', error);
      throw new AppError(
        error?.message || 'Could not complete user signup.',
        error?.status || 400
      );
    }
  }

  async login(data: LoginDTO) {
    try {
      const user = await this.userService.findUserByEmail(data.email);

      if (!user) {
        throw new ResourceNotFoundException(
          'Could not find user with that email.'
        );
      }

      const verificationResult = await SecurityUtil.decryptAndVerifyPassword(
        data.password,
        user
      );

      return verificationResult;
    } catch (error) {
      log.error('login() error', error);
      throw new AppError(
        error?.message || 'Could not complete user login.',
        error?.status || 400
      );
    }
    ``;
  }
}
