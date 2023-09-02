import { FindOneOptions, Repository, getRepository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import logger from '../../utils/logger.util';
import { AppError } from '../../exceptions/AppError';
import { RiseVestStatusMsg } from '../../enums/rise-response.enum';
import { PageOptionsDTO } from '../../paging/page-option.dto';
import { PageMetaDTO } from '../../paging/page-meta.dto';
import { PageDTO } from '../../paging/page.dto';
import { UserAlreadyExistsException } from '../../exceptions/UserAlreadyExistsException';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';


const log = logger.getLogger();

export default class UserService {
  constructor(private userRepository: Repository<User>) {
    this.userRepository = getRepository<User>(User);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      const options: FindOneOptions<User> = {
        where: {
          email: data.email,
          is_active: true,
        },
      };
      const userAlreadyExists = await this.userRepository.findOne(options);

      if (userAlreadyExists) {
        throw new UserAlreadyExistsException();
      }

      const newUser = this.userRepository.create(data);
      return await this.userRepository.save(newUser);
    } catch (error) {
      log.error('createUser() error', error);

      throw new AppError(
        error?.message || RiseVestStatusMsg.FAILED,
        error?.statusCode || 400
      );
    }
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.findUserById(id);
      Object.assign(user, data);
      return await this.userRepository.save(user);
    } catch (error) {
      log.error('updateUser() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async findUserById(id: string): Promise<User> {
    try {
      const options: FindOneOptions<User> = {
        where: {
          id,
          is_active: true,
        },
      };

      return await this.userRepository.findOne(options);
    } catch (error) {
      log.error('findUserById() error', error);
      throw new AppError('Unable to find user with that id', 400);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const options: FindOneOptions<User> = {
        where: {
          email,
          is_active: true,
        },
      };
      return await this.userRepository.findOne(options);
    } catch (error) {
      log.error('findUserByEmail() error', error);
      throw new AppError('Unable to find user with that email', 400);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        return false;
      }

      const update: Partial<UpdateUserDTO> = {
        is_active: false,
      };

      Object.assign(user, update);

      await this.userRepository.save(user);
      return true;
    } catch (error) {
      log.error('deleteUser() error', error);
      throw new AppError(RiseVestStatusMsg.FAILED, 400);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.findUserById(id);

      if (!user)
        throw new ResourceNotFoundException("Couldn't find user with that id");

      return user;
    } catch (error) {
      log.error('getUser() error', error);
      throw new AppError(
        error?.message || RiseVestStatusMsg.FAILED,
        error?.statusCode || 400
      );
    }
  }

  async getAllUsers(pageOptionsDTO: PageOptionsDTO): Promise<PageDTO<User>> {
    try {
      let [items, count] = await this.userRepository.findAndCount({
        where: {
          is_active: true,
        },
        skip: pageOptionsDTO?.skip,
        take: pageOptionsDTO?.take,
      });

      const pageMetaDTO = new PageMetaDTO({
        page_options_dto: pageOptionsDTO,
        total_items: count,
      });

      return new PageDTO(items, pageMetaDTO);
    } catch (error) {
      log.error('getAllUsers() error', error);
      throw new AppError(
        error?.message || RiseVestStatusMsg.FAILED,
        error?.statusCode || 400
      );
    }
  }
}
