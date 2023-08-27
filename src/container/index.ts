/**
 * This file serves as the dependency injection (DI) container for the application.
 *  NestJS creates something like this for us on its own when our application bootstraps so we don't have to but we have to it manually in Express.
 */

import { Repository, getRepository } from 'typeorm';
import { User } from '../modules/user/entities/user.model';
import { Folder } from '../modules/folder/entities/folder.model';
import UserService from '../modules/user/user.service';
import FileService from '../modules/file/file.service';
import StorageService from '../services/storage.service';
import { File } from '../modules/file/entities/file.model';
import FolderService from '../modules/folder/folder.service';
import AuthService from '../modules/user/auth/auth.service';
import UserController from '../modules/user/user.controller';
import AuthController from '../modules/user/auth/auth.controller';
import FileController from '../modules/file/file.controller';
import FolderController from '../modules/folder/folder.controller';

/**
 * @author aggr3550r
 */

/* REPOSITORIES */
const userRepository: Repository<User> = getRepository(User);
const fileRepository: Repository<File> = getRepository(File);
const folderRepository: Repository<Folder> = getRepository(Folder);

/* SERVICES */

export const storageService = new StorageService();
export const userService = new UserService(userRepository);
export const fileService = new FileService(
  fileRepository,
  storageService,
  userService
);
export const folderService = new FolderService(
  folderRepository,
  userService,
  fileService
);
export const authService = new AuthService(userService);

/* CONTROLLERS */

export const authController = new AuthController(authService);
export const userController = new UserController(userService, authService);
export const fileController = new FileController(fileService);
export const folderController = new FolderController(folderService);
