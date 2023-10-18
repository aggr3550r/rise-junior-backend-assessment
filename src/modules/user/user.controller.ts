import { HttpStatus } from '../../enums/http-status.enum';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { ResponseModel } from '../../models/utility/ResponseModel';

import AuthService from './auth/auth.service';
import { User } from './entities/user.entity';
import UserService from './user.service';

export default class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  async registerUser(request: any): Promise<ResponseModel<User>> {
    try {
      const { email, password, full_name, role = '' } = request.body;
      const data = await this.authService.signup({
        email,
        password,
        full_name,
        role,
      });
      return new ResponseModel(
        HttpStatus.CREATED,
        'User successfully created',
        data
      );
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || 'Error occurred while creating user',
        null
      );
    }
  }

  async updateUser(request: any) {
    try {
      const { userId } = request.params;
      const data = request.body;

      const serviceResponse = await this.userService.updateUser(userId, data);

      return new ResponseModel(
        HttpStatus.OK,
        'User successfully updated',
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async deleteUser(request: any) {
    try {
      const { id } = request.auth;

      await this.userService.deleteUser(id);

      return new ResponseModel(HttpStatus.OK, 'User successfully deleted.', {
        userId: id,
      });
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async getUser(request: any) {
    try {
      const { id } = request.params;

      const user = await this.userService.getUserById(id);

      return new ResponseModel(HttpStatus.OK, RiseVestStatusMsg.SUCCESS, user);
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async getAllUsers(request: any) {
    try {
      const queryOptions = request.query;

      const serviceResponse = await this.userService.getAllUsers(queryOptions);

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }
}
