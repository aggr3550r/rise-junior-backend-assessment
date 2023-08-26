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
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
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
      const fileAlreadyExists = await this.findFileByFilename(userId, filename);

      if (fileAlreadyExists) {
        throw new ResourceAlreadyExistsException(
          'File with that name already exists, choose another.'
        );
      }

      const fileSize = FileUtil.computeFileSize(file_path);

      data.owner = owner;
      data.filename = filename;
      data.file_path = file_path;

      const newFile = this.fileRepository.create(data);
      newFile.size = fileSize;
      return await this.fileRepository.save(newFile);
    } catch (error) {
      log.error('createFile() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async updateFile(
    userId: string,
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

  async uploadFile(userId: string, data: UploadFileDTO) {
    try {
      const fileKey = await this.storageService.uploadFileToS3(data);

      log.info(
        '** File uploaded to S3 bucket: collecting details...** \n ',
        fileKey
      );

      // So basically when a file is uploaded then we should also create a download link for it
      const file_download_link = await this.storageService.getDownloadUrl(
        fileKey
      );

      const { filename } = FileUtil.sanitizeFilePath(fileKey);

      // Update file. It can now be downloaded publicly
      await this.updateFile(userId, QueryType.NAME, filename, {
        file_download_link,
      });
    } catch (error) {
      log.error('uploadFile() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async serveDownload(
    userId: string,
    fileId?: string,
    filename?: string
  ): Promise<string> {
    try {
      let queryType: QueryType = QueryType.ID;
      let file: File;
      if (filename) {
        file = await this.findFileByEitherFilenameOrId(
          userId,
          filename,
          QueryType.NAME
        );
      } else file = await this.findFileByEitherFilenameOrId(userId, fileId);

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

  async reviewFile(fileId: string, data: ReviewFileDTO): Promise<File> {
    try {
      const file = await this.fileRepository.findOneBy({
        id: fileId,
        is_active: true,
      });
      let fileUnsafeFlagCount = file.unsafe_count;

      const userId = file.owner.id;

      if (data.fileFlag === FileFlag.UNSAFE) fileUnsafeFlagCount += 1;

      const updates: Partial<UpdateFileDTO & ReviewFileDTO> = {
        file_flag: data.fileFlag,
        unsafe_count: fileUnsafeFlagCount,
        admin_review_comment: data.admin_review_comment,
      };

      if (fileUnsafeFlagCount >= 3) {
        await this.deleteFile(userId, fileId);
      }

      return await this.updateFile(userId, QueryType.ID, fileId, updates);
    } catch (error) {
      log.error('reviewFile() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async getFileById(userId: string, fileId: string): Promise<File> {
    try {
      const file = await this.findFileById(userId, fileId);
      return file;
    } catch (error) {
      log.error('getFileById() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
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
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async getFilesForUser(
    userId: string,
    getFileOptionsPageDTO: GetFileOptionsPageDTO
  ): Promise<PageDTO<File>> {
    try {
      let [items, count] = await this.fileRepository.findAndCount({
        where: {
          owner: { id: userId },
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
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async findFileByEitherFilenameOrId(
    userId: string,
    queryString: string,
    queryType?: QueryType
  ) {
    try {
      let file: File;
      if (queryType === QueryType.NAME)
        file = await this.findFileByFilename(userId, queryString);
      else file = await this.findFileById(userId, queryString);

      return file;
    } catch (error) {
      log.error('findFileByEitherFilenameOrId() error', error);
      throw new AppError('Could not find file by either of those tokens', 400);
    }
  }

  async findFileById(fileId: string, userId: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          id: fileId,
          is_active: true,
          owner: { id: userId },
        },
      };

      const fileExists = await this.fileRepository.findOne(options);

      if (!fileExists) {
        throw new ResourceNotFoundException(
          `File with that id ${fileId} does not exist!`
        );
      }
      return fileExists;
    } catch (error) {
      log.error('findUserById() error', error);
      throw new AppError('Unable to find file with that id', 400);
    }
  }

  async findFileByFilename(userId: string, filename: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          filename,
          is_active: true,
          owner: { id: userId },
        },
      };

      const file = await this.fileRepository.findOne(options);

      return file;
    } catch (error) {
      log.error('findFileByFilename() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async deleteFile(userId: string, fileId: string) {
    try {
      const file = await this.findFileById(userId, fileId);
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
