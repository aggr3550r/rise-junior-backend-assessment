import { authController } from '../container';
import ApiRouter, { HttpMethod } from '../utils/api.router';

const authRouter = new ApiRouter();

authRouter.addPattern(
  HttpMethod.POST,
  '/',
  authController.login.bind(authController)
);

export default authRouter.getExpressRouter();
