import { FindOneOptions, Repository, getRepository } from 'typeorm';
import { Folder } from './entities/folder.model';
import { UserService } from '../user/user.service';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { RiseStatusMessage } from '../../enums/rise-response.enum';
import { FileService } from '../file/file.service';
import { PageDTO } from '../../paging/page.dto';
import { GetFolderOptionsDTO } from './dtos/get-folder-options.dto';
import { PageMetaDTO } from '../../paging/page-meta.dto';

const log = logger.getLogger();
export class FolderService {
  constructor(
    private folderRepository: Repository<Folder>,
    private readonly userService: UserService,
    private readonly fileService: FileService
  ) {
    this.folderRepository = getRepository(Folder);
  }

  async createFolder(name: string, ownerId: string) {
    try {
      const owner = await this.userService.findUserById(ownerId);
      const newFolder = this.folderRepository.create({ name, owner });
      return await this.folderRepository.save(newFolder);
    } catch (error) {}
  }

  async updateFolder(id: string, name: string): Promise<Folder | null> {
    const folder = await this.findFolderById(id);
    folder.name = name;
    return await this.folderRepository.save(folder);
  }

  async deleteFolder(id: string): Promise<boolean> {
    const folder = await this.findFolderById(id);
    await this.folderRepository.remove(folder);
    return true;
  }

  async findFolderById(id: string): Promise<Folder> {
    try {
      const options: FindOneOptions<Folder> = {
        where: {
          id,
          is_active: true,
        },
      };

      const folderExists = await this.folderRepository.findOne(options);

      if (!folderExists) {
        throw new ResourceNotFoundException(
          `File with that id ${id} does not exist!`
        );
      }

      return folderExists;
    } catch (error) {
      log.error('findFolderById() error', error);
      throw new AppError('Unable to find file with that id', 400);
    }
  }

  async findFolderByName(folderName: string): Promise<Folder> {
    try {
      const options: FindOneOptions<Folder> = {
        where: {
          name: folderName,
          is_active: true,
        },
      };

      const folder = await this.folderRepository.findOne(options);

      if (!folder)
        throw new ResourceNotFoundException(
          'Could not find a folder with that namne'
        );

      return folder;
    } catch (error) {
      log.error('findFolderByName() error', error);
      throw new AppError(RiseStatusMessage.FAILED, 400);
    }
  }

  async addFileToFolder(
    folderId: string,
    fileId: string
  ): Promise<Folder | null> {
    try {
      const options: FindOneOptions<Folder> = {
        where: {
          id: folderId,
          is_active: true,
        },
        loadRelationIds: {
          relations: ['files'],
        },
      };
      const folder = await this.folderRepository.findOne(options);

      const file = await this.fileService.findFileById(fileId);
      if (!folder || !file) {
        throw new ResourceNotFoundException();
      }
      folder.files.push(file);
      return await this.folderRepository.save(folder);
    } catch (error) {
      log.error('addFileToFolder() error', error);
      throw new AppError(
        error.message || RiseStatusMessage.FAILED,
        error.status || 400
      );
    }
  }

  async getFoldersForUser(
    userId: string,
    getFolderOptionsDTO: GetFolderOptionsDTO
  ): Promise<PageDTO<Folder>> {
    try {
      const [items, count] = await this.folderRepository.findAndCount({
        where: { owner: { id: userId } },
        relations: ['files'], // Include related files
        skip: getFolderOptionsDTO?.skip,
        take: getFolderOptionsDTO?.take,
      });

      const pageMetaDTO = new PageMetaDTO({
        page_options_dto: getFolderOptionsDTO,
        total_items: count,
      });

      return new PageDTO(items, pageMetaDTO);
    } catch (error) {
      log.error('getFoldersForUser() error', error);
      throw new AppError('Failed to fetch folders for user.', error);
    }
  }
}
