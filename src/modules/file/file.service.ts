import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  getRepository,
} from 'typeorm';
import { CreateFileDTO } from './dtos/create-file.dto';
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
import { FileFlag } from '../../enums/file-flag.enum';
import { UserService } from '../user/user.service';
import { FolderService } from '../folder/folder.service';
import { QueryType } from '../../enums/query-type.enum';

const log = logger.getLogger();

export class FileService {
  constructor(
    private fileRepository: Repository<File>,
    private storageService: StorageService,
    private userService: UserService
  ) {
    this.fileRepository = getRepository(File);
  }

  async createFile(userId: string, data: CreateFileDTO): Promise<File> {
    try {
      const owner = await this.userService.findUserById(userId);

      const { file_path, filename } = FileUtil.sanitizeFilePath(data.file_path);

      // Make sure no files with same filename already exist
      const fileAlreadyExists = await this.findFileByFilename(filename);

      if (fileAlreadyExists) {
        throw new ResourceAlreadyExistsException(
          'File with that name already exists, choose another.'
        );
      }

      const fileSize = FileUtil.computeFileSize(file_path);

      data.size = fileSize;
      data.owner = owner;

      const newFile = this.fileRepository.create(data);
      return await this.fileRepository.save(newFile);
    } catch (error) {
      log.error('createFile() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async updateFile(
    queryType: QueryType,
    queryString: string,
    updates: Partial<UpdateFileDTO>
  ): Promise<File> {
    try {
      const file = await this.findFileByEitherFilenameOrId(
        queryString,
        queryType
      );

      Object.assign(file, updates);

      return await this.fileRepository.save(file);
    } catch (error) {
      log.error('updateFile() error', error);
      throw new AppError(error.message, 400);
    }
  }

  async uploadFile(data: UploadFileDTO) {
    try {
      const fileKey = await this.storageService.uploadFileToS3(data);

      log.info(
        '** File uploaded to S3 bucket: collecting details...*** \n ',
        fileKey
      );

      // So when a file is uploaded then we should also create a download link for it
      const file_download_link = await this.storageService.getDownloadUrl(
        fileKey
      );

      const { filename } = FileUtil.sanitizeFilePath(fileKey);

      // Update file. It can now be downloaded publicly
      await this.updateFile(QueryType.NAME, filename, { file_download_link });
    } catch (error) {
      log.error('uploadFile() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async serveDownload(fileId?: string, filename?: string): Promise<string> {
    try {
      let queryType: QueryType = QueryType.ID;
      let file: File;
      if (filename) {
        file = await this.findFileByEitherFilenameOrId(
          filename,
          QueryType.NAME
        );
      } else file = await this.findFileByEitherFilenameOrId(fileId);

      const { file_download_link } = file;

      return file_download_link;
    } catch (error) {
      log.error('serveDownload() error', error);
      throw new AppError(
        "Oops! For some reason your download couldn't be fetched from the DB. It's on us.",
        400
      );
    }
  }

  async reviewFile(id: string, data: ReviewFileDTO): Promise<File> {
    try {
      const file = await this.findFileById(id);

      const adminReviewCount = file.admin_review_count + 1;

      const updates: Partial<UpdateFileDTO & ReviewFileDTO> = {
        file_flag: data.fileFlag,
        admin_review_count: adminReviewCount,
        admin_review_comment: data.admin_review_comment,
      };

      if (updates.fileFlag === FileFlag.UNSAFE && adminReviewCount >= 3) {
        await this.deleteFile(id);
      }
      return await this.updateFile(QueryType.ID, id, updates);
    } catch (error) {
      log.error('reviewFile() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async getFileById(id: string): Promise<File> {
    try {
      const file = await this.findFileById(id);
      return file;
    } catch (error) {
      log.error('getFileById() error', error);
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
        skip: getFileOptionsPageDTO?.skip,
        take: getFileOptionsPageDTO?.take,
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

  async getFilesForUser(
    getFileOptionsPageDTO: GetFileOptionsPageDTO
  ): Promise<PageDTO<File>> {
    try {
      let [items, count] = await this.fileRepository.findAndCount({
        where: {
          id: getFileOptionsPageDTO.fileId,
          owner: { id: getFileOptionsPageDTO.userId },
          is_active: true,
        },
        skip: getFileOptionsPageDTO?.skip,
        take: getFileOptionsPageDTO?.take,
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

  async findFileByEitherFilenameOrId(
    queryString: string,
    queryType?: QueryType
  ) {
    try {
      let file: File;
      if (queryType === QueryType.NAME)
        file = await this.findFileByFilename(queryString);
      else file = await this.findFileById(queryString);

      return file;
    } catch (error) {
      log.error('findFileByEitherFilenameOrId() error', error);
      throw new AppError('Could not find file by either of those tokens', 400);
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

      const fileExists = await this.fileRepository.findOne(options);

      if (!fileExists) {
        throw new ResourceNotFoundException(
          `File with that id ${id} does not exist!`
        );
      }
      return fileExists;
    } catch (error) {
      log.error('findUserById() error', error);
      throw new AppError('Unable to find file with that id', 400);
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
