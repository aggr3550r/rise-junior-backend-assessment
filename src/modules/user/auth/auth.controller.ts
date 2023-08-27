import { HttpStatus } from '../../../enums/http-status.enum';
import { RiseVestStatusMsg } from '../../../enums/rise-response.enum';
import { ResponseModel } from '../../../models/utility/ResponseModel';
import AuthService from './auth.service';

export default class AuthController {
  constructor(private authService: AuthService) {}

  async login(request: any, response: any) {
    try {
      const { email, password } = request.body;
      const serviceResponse = await this.authService.login({ email, password });

      if (serviceResponse) {
        await this.authService.createAndSendAuthToken(
          serviceResponse,
          200,
          response
        );
      }
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || 'Error occurred while logging user in.',
        null
      );
    }
  }

  async signup(request: any) {
    try {
      const { email, password } = request.body;
      const serviceResponse = await this.authService.signup({
        email,
        password,
      });

      return new ResponseModel(
        HttpStatus.CREATED,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || 'Error occurred while logging user in.',
        null
      );
    }
  }
}
