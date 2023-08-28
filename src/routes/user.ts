import { userController } from '../container';
import ApiRouter, { HttpMethod } from '../utils/api.router';

const userRouter = new ApiRouter();

userRouter.addPattern(
  HttpMethod.POST,
  '/',
  userController.registerUser.bind(userController)
);

userRouter.addIsAdminPattern(
  HttpMethod.PATCH,
  '/:userId',
  userController.updateUser.bind(userController)
);

userRouter.addIsAuthenticatedPattern(
  HttpMethod.DELETE,
  '/',
  userController.deleteUser.bind(userController)
);

userRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/:id',
  userController.getUser.bind(userController)
);

userRouter.addIsAdminPattern(
  HttpMethod.GET,
  '/',
  userController.getAllUsers.bind(userController)
);

export default userRouter.getExpressRouter();
