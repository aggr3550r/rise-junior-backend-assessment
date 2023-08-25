import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  getRepository,
} from 'typeorm';
import { CreateFileDTO } from './dtos/create-file.dto';
import { User } from '../user/entities/user.model';
import FileUtil from '../../utils/file.util';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { RiseStatusMessage } from '../../enums/rise-response.enum';
import { File } from './entities/file.model';
import { ResourceAlreadyExistsException } from '../../exceptions/ResourceAlreadyExistsException';
import { UploadFileDTO } from './dtos/upload-file.dto';
import { UpdateFileDTO } from './dtos/update-file.dto';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';
import { PageMetaDTO } from '../../paging/page-meta.dto';
import { PageDTO } from '../../paging/page.dto';
import { GetFileOptionsPageDTO } from './dtos/get-file-options.dto';
import { ReviewFileDTO } from './dtos/review-file.dto';
import { StorageService } from '../../services/storage.service';

const log = logger.getLogger();

export class FileService {
  constructor(
    private fileRepository: Repository<File>,
    private storageService: StorageService
  ) {
    this.fileRepository = getRepository(File);
  }

  async createFile(user: User, data: CreateFileDTO) {
    try {
      const { file_path, filename } = FileUtil.sanitizeFilePath(data.file_path);

      // Make sure no files with same filename already exist
      const fileAlreadyExists = await this.findFileByFilename(filename);

      if (fileAlreadyExists) {
        throw new ResourceAlreadyExistsException();
      }

      const fileSize = FileUtil.computeFileSize(file_path);

      data.size = fileSize;
      data.owner = user;

      const newFile = this.fileRepository.create(data);
      return await this.fileRepository.save(newFile);
    } catch (error) {
      log.error('createFile() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async uploadFile(data: UploadFileDTO) {
    try {
      await this.storageService.uploadFileToS3(data);
    } catch (error) {
      log.error('uploadFile() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async updateFile(id: string, updates: UpdateFileDTO) {
    try {
      const file = await this.findFileById(id);

      if (!file) throw new ResourceNotFoundException();

      Object.assign(file, updates);
      return await this.fileRepository.save(file);
    } catch (error) {
      log.error('updateFile() error', error);
      throw new AppError(error.message, 400);
    }
  }

  async reviewFile(data: ReviewFileDTO) {
    try {
    } catch (error) {
      log.error('reviewFile() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async getFileById() {
    try {
    } catch (error) {
      log.error('getFileById() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async getFilesForUser(getFileOptionsPageDTO: GetFileOptionsPageDTO) {
    try {
      let [items, count] = await this.fileRepository.findAndCount({
        where: {
          id: getFileOptionsPageDTO.fileId,
          owner: { id: getFileOptionsPageDTO.userId },
          is_active: true,
        },
      });

      const pageMetaDTO = new PageMetaDTO({
        page_options_dto: getFileOptionsPageDTO,
        total_items: count,
      });

      return new PageDTO(items, pageMetaDTO);
    } catch (error) {
      log.error('getFilesForUser() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async getAllFilesByCustomQuery(getFileOptionsPageDTO: GetFileOptionsPageDTO) {
    try {
      const { customKey, customValue } = getFileOptionsPageDTO;

      const where: FindManyOptions<File & GetFileOptionsPageDTO>['where'] = {};
      where.is_active = true;

      if (customKey && customValue) {
        (where as any)[customKey] = customValue;
      }

      let [items, count] = await this.fileRepository.findAndCount({
        where: {
          is_active: true,
        },
      });

      const pageMetaDTO = new PageMetaDTO({
        page_options_dto: getFileOptionsPageDTO,
        total_items: count,
      });

      return new PageDTO(items, pageMetaDTO);
    } catch (error) {
      log.error('getAllFilesByCustomQuery() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async findFileByFilename(filename: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          filename,
          is_active: true,
        },
      };

      const file = await this.fileRepository.findOne(options);

      return file;
    } catch (error) {
      log.error('findFileByFilename() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async findFileById(id: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          id,
          is_active: true,
        },
      };

      return await this.fileRepository.findOne(options);
    } catch (error) {
      log.error('findUserById() error', error);
      throw new AppError('Unable to find file with that id', 400);
    }
  }

  async deleteFile(id: string) {
    try {
      const file = await this.findFileById(id);
      if (!file) {
        return false;
      }

      const update: Partial<UpdateFileDTO> = {
        is_active: false,
      };

      Object.assign(file, update);

      await this.fileRepository.save(file);

      const fileName = file.filename;
      const folderName = file?.folder?.name;

      await this.storageService.removeFileFromS3(fileName, folderName);

      return true;
    } catch (error) {
      log.error('deleteFile() error', error);
      throw new AppError('An error occured while deleting that file', 400);
    }
  }
}
