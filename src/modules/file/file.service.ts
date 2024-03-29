import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  getRepository,
} from 'typeorm';
import { CreateFileDTO } from './dtos/create-file.dto';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { File } from './entities/file.entity';
import { ResourceAlreadyExistsException } from '../../exceptions/ResourceAlreadyExistsException';
import { UploadFileDTO } from './dtos/upload-file.dto';
import { UpdateFileDTO } from './dtos/update-file.dto';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';
import { PageMetaDTO } from '../../paging/page-meta.dto';
import { PageDTO } from '../../paging/page.dto';
import { GetFileOptionsPageDTO } from './dtos/get-file-options.dto';
import { ReviewFileDTO } from './dtos/review-file.dto';
import StorageService from '../../services/storage.service';
import { FileFlag } from '../../enums/file-flag.enum';
import UserService from '../user/user.service';
import { QueryType } from '../../enums/query-type.enum';


const log = logger.getLogger();

export default class FileService {
  constructor(
    private fileRepository: Repository<File>,
    private storageService: StorageService,
    private userService: UserService
  ) {
    this.fileRepository = getRepository<File>(File);
  }

  async createFile(userId: string, data: CreateFileDTO): Promise<File> {
    try {
      const owner = await this.userService.findUserById(userId);

      const { filename, file_path, size } = data;
      const createData: Partial<File> = {
        file_path,
        filename,
        size,
      };

      // Make sure no files with same filename already exist
      const fileAlreadyExists = await this.findFileByFilename(
        userId,
        data.filename
      );

      if (fileAlreadyExists) {
        throw new ResourceAlreadyExistsException(
          "File with that name already exists, choose another file or rename the one you're currently trying to upload."
        );
      }

      data.owner = owner;

      const newFile = this.fileRepository.create(data);
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
        userId,
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

  async uploadFile(userId: string, data: UploadFileDTO, file: any) {
    try {
      const fileKey = await this.storageService.uploadFileToS3(data, file);

      log.info(
        '** File uploaded to S3 bucket: collecting details...** \n ',
        fileKey
      );

      // So basically when a file is uploaded then we should also create a download link for it
      const file_download_link = await this.storageService.getDownloadUrl(
        fileKey
      );

      let fileId: string;

      if (file_download_link) {
        const data: CreateFileDTO = {
          file_path: file.originalname,
          filename: file.originalname,
          size: file.size,
        };

        const { id } = await this.createFile(userId, data);

        fileId = id;
      }

      // Update file. It can now be downloaded publicly
      await this.updateFile(userId, QueryType.NAME, file.originalname, {
        file_download_link,
      });

      return { file_download_link, fileId };
    } catch (error) {
      log.error('uploadFile() error', error);
      throw new AppError(
        error?.message || RiseVestStatusMsg.FAILED,
        error?.statusCode || 400
      );
    }
  }

  async serveDownload(
    userId: string,
    fileId?: string,
    filename?: string
  ): Promise<string> {
    try {
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

  async reviewFile(
    fileId: string,
    data: ReviewFileDTO
  ): Promise<File | boolean> {
    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId, is_active: true },
        relations: ['owner'],
      });
      let fileUnsafeFlagCount = file.unsafe_count;

      const userId = file.owner.id;

      if (data.file_flag === FileFlag.UNSAFE) fileUnsafeFlagCount += 1;

      const updates: Partial<UpdateFileDTO & ReviewFileDTO> = {
        file_flag: data.file_flag,
        unsafe_count: fileUnsafeFlagCount,
        admin_review_comment: data.admin_review_comment,
      };

      if (fileUnsafeFlagCount >= 3) {
        return await this.deleteFile(userId, fileId);
      }

      return await this.updateFile(userId, QueryType.ID, fileId, updates);
    } catch (error) {
      log.error('reviewFile() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, error?.statusCode || 400);
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
      const queryPage = new GetFileOptionsPageDTO();
      let [items, count] = await this.fileRepository.findAndCount({
        where: {
          owner: { id: userId, is_active: true },
          is_active: true,
        },
        skip: getFileOptionsPageDTO?.skip,
        take: getFileOptionsPageDTO?.take,
      });

      console.info('QUERY QUERY \n %o', queryPage);

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

  async findFileById(userId: string, fileId: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          id: fileId,
          is_active: true,
          owner: { id: userId, is_active: true },
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
      log.error('findFileById() error', error);
      throw new AppError('Unable to find file with that id', 400);
    }
  }

  async findFileByFilename(userId: string, filename: string) {
    try {
      const options: FindOneOptions<File> = {
        where: {
          filename,
          is_active: true,
          owner: { id: userId, is_active: true },
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
