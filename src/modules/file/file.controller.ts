import { HttpStatus } from '../../enums/http-status.enum';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { ResponseModel } from '../../models/utility/ResponseModel';
import logger from '../../utils/logger.util';
import { CreateFileDTO } from './dtos/create-file.dto';
import { GetFileOptionsPageDTO } from './dtos/get-file-options.dto';
import { UpdateFileDTO } from './dtos/update-file.dto';
import { UploadFileDTO } from './dtos/upload-file.dto';
import FileService from './file.service';

const log = logger.getLogger();

export default class FileController {
  constructor(private fileService: FileService) {}

  async uploadFile(request: any) {
    try {
      const filePath = request.file.path;
      const { id: userId } = request.auth;
      const data: CreateFileDTO = {
        file_path: filePath,
      };

      const file = await this.fileService.createFile(userId, data);

      const uploadData: UploadFileDTO = {
        file_path: file.file_path,
        folder_name: file?.folder.name,
        filename: file.filename,
      };

      await this.fileService.uploadFile(userId, uploadData);

      log.info('** uploaded file to s3 bucket... **', uploadData);

      return new ResponseModel(
        HttpStatus.OK,
        'Successfully uploaded file.',
        file
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || 'Failed to upload file.',
        null
      );
    }
  }

  async updateFile(request: any) {
    try {
      const { queryType, queryString } = request.query;
      const updates: Partial<UpdateFileDTO> = request.body;
      const { id: userId } = request.auth;

      const file = await this.fileService.updateFile(
        userId,
        queryType,
        queryString,
        updates
      );

      return new ResponseModel(
        HttpStatus.OK,
        'Successfully updated file.',
        file
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async downloadFile(request: any) {
    try {
      const { fileId = '', filename = '' } = request.params;
      const { id: userId } = request.auth;

      const download_link = await this.fileService.serveDownload(
        userId,
        fileId,
        filename
      );

      return new ResponseModel(
        HttpStatus.OK,
        RiseVestStatusMsg.SUCCESS,
        download_link
      );
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async getFilesForUser(request: any) {
    try {
      const queryObject: GetFileOptionsPageDTO = request.query;
      const { id: userId } = request.auth;

      const files = await this.fileService.getFilesForUser(userId, queryObject);

      return new ResponseModel(HttpStatus.OK, RiseVestStatusMsg.SUCCESS, files);
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }

  async reviewFile(request: any) {
    try {
      const { fileId } = request.params;

      const data = request.body;

      const serviceResponse = await this.fileService.reviewFile(fileId, data);

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

  async getFile(request: any) {
    try {
      const { id: userId } = request.auth;
      const { fileId } = request.params;

      const file = await this.fileService.getFileById(userId, fileId);

      return new ResponseModel(HttpStatus.OK, RiseVestStatusMsg.SUCCESS, file);
    } catch (error) {
      return new ResponseModel(
        error?.status || HttpStatus.BAD_REQUEST,
        error?.message || RiseVestStatusMsg.FAILED,
        null
      );
    }
  }
}
