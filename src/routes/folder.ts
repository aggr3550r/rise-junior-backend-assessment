import { folderController } from '../container';
import ApiRouter, { HttpMethod } from '../utils/api.router';

const folderRouter = new ApiRouter();

folderRouter.addPattern(
  HttpMethod.POST,
  '/',
  folderController.createFolder.bind(folderController)
);

folderRouter.addIsAuthenticatedPattern(
  HttpMethod.PUT,
  '/:folderId',
  folderController.updateFolder.bind(folderController)
);

folderRouter.addIsAuthenticatedPattern(
  HttpMethod.DELETE,
  '/:folderId',
  folderController.deleteFolder.bind(folderController)
);

folderRouter.addIsAuthenticatedPattern(
  HttpMethod.PUT,
  '/:folderId/:fileId',
  folderController.addFileToFolder.bind(folderController)
);

folderRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/:folderId',
  folderController.getFolder.bind(folderController)
);

folderRouter.addIsAuthenticatedPattern(
  HttpMethod.GET,
  '/',
  folderController.getFolders.bind(folderController)
);

export default folderRouter.getExpressRouter();
