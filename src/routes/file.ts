import { fileController } from '../container';
import ApiRouter, { HttpMethod } from '../utils/api.router';
import multer from 'multer';

const multerForm = multer();

const fileRouter = new ApiRouter();

fileRouter.addIsAuthenticatedPattern(
  HttpMethod.POST,
  '/upload',
  fileController.uploadFile.bind(fileController),
  multerForm.single('file')
);

fileRouter.addIsAuthenticatedPattern(
  HttpMethod.PUT,
  '/',
  fileController.updateFile.bind(fileController)
);

fileRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/:fileId?/:filename?/download',
  fileController.downloadFile.bind(fileController)
);

fileRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/:fileId',
  fileController.getFile.bind(fileController)
);

fileRouter.addIsAdminPattern(
  HttpMethod.PUT,
  '/:fileId',
  fileController.reviewFile.bind(fileController)
);

fileRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/',
  fileController.getFilesForUser.bind(fileController)
);

export default fileRouter.getExpressRouter();
