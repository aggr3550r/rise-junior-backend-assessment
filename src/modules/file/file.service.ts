import { FindOneOptions, Repository, getRepository } from 'typeorm';
import { CreateFileDTO } from './dtos/create-file.dto';
import { User } from '../user/entities/user.model';
import FileUtil from '../../utils/file.util';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { RiseStatusMessage } from '../../enums/rise-response.enum';
import { File } from './entities/file.model';
import { ResourceAlreadyExistsException } from '../../exceptions/ResourceAlreadyExistsException';

const log = logger.getLogger();

export class FileService {
  constructor(private fileRepository: Repository<File>) {
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
      throw new AppError(error.message, 400);
    }
  }

  async uploadFile() {}

  async updateFile() {}

  async deleteFile() {}

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
}
