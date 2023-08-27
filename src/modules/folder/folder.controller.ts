import { HttpStatus } from '../../enums/http-status.enum';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { ResponseModel } from '../../models/utility/ResponseModel';
import FolderService from './folder.service';

export default class FolderController {
  constructor(private folderService: FolderService) {}

  async createFolder(request: any) {
    try {
      const { id: userId } = request.auth;
      const { name } = request.body;

      const serviceResponse = await this.folderService.createFolder(
        name,
        userId
      );

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || 'Failed to upload file.',
        null
      );
    }
  }

  async updateFolder(request: any) {
    try {
      const { id: userId } = request.auth;
      const { folderId } = request.params;
      const { name } = request.body;

      const serviceResponse = await this.folderService.updateFolder(
        userId,
        folderId,
        name
      );

      return new ResponseModel(
        HttpStatus.OK,
        'User successfully updated.',
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || 'Failed to upload file.',
        null
      );
    }
  }

  async deleteFolder(request: any) {
    try {
      const { id: userId } = request.auth;
      const { folderId } = request.params;

      const serviceResponse = this.folderService.deleteFolder(userId, folderId);

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async getFolder(request: any) {
    try {
      const { id: userId } = request.auth;
      const { folderId } = request.params;

      const serviceResponse = this.folderService.findFolderById(
        userId,
        folderId
      );

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async addFileToFolder(request: any) {
    try {
      const { id: userId } = request.auth;
      const { fileId, folderId } = request.params;

      const serviceResponse = await this.folderService.addFileToFolder(
        userId,
        folderId,
        fileId
      );

      return new ResponseModel(
        HttpStatus.OK,
        'File successfully added to folder',
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async getFolders(request: any) {
    try {
      const { id: userId } = request.auth;
      const queryOptions = request.query;

      const serviceResponse = await this.folderService.getFoldersForUser(
        userId,
        queryOptions
      );

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }
}
