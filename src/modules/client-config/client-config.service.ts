import { Repository, getRepository } from 'typeorm';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';
import { ClientConfig } from './entities/client-config.entity';
import {
  CreateClientConfigDTO,
  UpdateClientConfigDTO,
} from './dtos/client-config.dto';

const log = logger.getLogger();

export class ClientConfigService {
  constructor(private clientConfigRepository: Repository<ClientConfig>) {
    this.clientConfigRepository = getRepository<ClientConfig>(ClientConfig);
  }

  async findClientConfigById(id: string) {
    try {
      const clientConfig = await this.clientConfigRepository.findOne({
        where: {
          id,
        },
      });

      if (!clientConfig) {
        throw new ResourceNotFoundException('Could not find client config.');
      }

      return clientConfig;
    } catch (error) {
      log.error('findClientConfigById() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async createClientConfig(createClientDTO: CreateClientConfigDTO) {
    try {
      let clientConfig = this.clientConfigRepository.create(createClientDTO);

      return await this.clientConfigRepository.save(clientConfig);
    } catch (error) {
      log.error('createClientConfig() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async updateClientConfig(id: string, updateClientDTO: UpdateClientConfigDTO) {
    try {
      await this.findClientConfigById(id);

      await this.clientConfigRepository.update({ id }, { ...updateClientDTO });
    } catch (error) {
      log.error('updateClientConfig() error', error);
      throw new AppError(error.message, error.status);
    }
  }
}
