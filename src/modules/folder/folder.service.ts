import { FindOneOptions, Repository, getRepository } from 'typeorm';
import { Folder } from './entities/folder.model';
import { UserService } from '../user/user.service';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { FileService } from '../file/file.service';
import { PageDTO } from '../../paging/page.dto';
import { GetFolderOptionsDTO } from './dtos/get-folder-options.dto';
import { PageMetaDTO } from '../../paging/page-meta.dto';
import { UnauthorizedException } from '../../exceptions/UnauthorizedException';

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
    } catch (error) {
      log.error('createFolder() error \n', error);
      throw new AppError('Unable to create file.', 400);
    }
  }

  async updateFolder(
    userId: string,
    folderId: string,
    name: string
  ): Promise<Folder> {
    try {
      const folder = await this.findFolderById(userId, folderId);
      folder.name = name;
      return await this.folderRepository.save(folder);
    } catch (error) {
      log.error('updateFolder() error \n', error);
      throw new AppError('An error occurred while updating folder.', 400);
    }
  }

  async deleteFolder(userId: string, folderId: string): Promise<boolean> {
    try {
      const folder = await this.findFolderById(userId, folderId);
      await this.folderRepository.remove(folder);
      return true;
    } catch (error) {
      log.error('deleteFolder() error \n', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async findFolderById(userId: string, folderId: string): Promise<Folder> {
    try {
      const options: FindOneOptions<Folder> = {
        where: {
          id: folderId,
          is_active: true,
          owner: { id: userId },
        },
      };

      const folderExists = await this.folderRepository.findOne(options);

      if (!folderExists) {
        throw new ResourceNotFoundException(
          `Folder with that id ${folderId} does not exist!`
        );
      }

      return folderExists;
    } catch (error) {
      log.error('findFolderById() error \n', error);
      throw new AppError('Unable to find file with that id', 400);
    }
  }

  async addFileToFolder(
    userId: string,
    folderId: string,
    fileId: string
  ): Promise<Folder | null> {
    try {
      const options: FindOneOptions<Folder> = {
        where: {
          id: folderId,
          is_active: true,
          owner: { id: userId },
        },
        loadRelationIds: {
          relations: ['files'],
        },
      };
      const folder = await this.folderRepository.findOne(options);

      const file = await this.fileService.findFileById(userId, fileId);

      if (!folder || !file) throw new ResourceNotFoundException();

      if (folder.owner.id !== file.owner.id)
        throw new UnauthorizedException(
          'You are not authorized to move that file.'
        );

      folder.files.push(file);

      return await this.folderRepository.save(folder);
    } catch (error) {
      log.error('addFileToFolder() error \n', error);
      throw new AppError(
        error.message || RiseVestStatusMsg.FAILED,
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
