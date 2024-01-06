import { Repository, getRepository } from 'typeorm';
import { Client } from './entities/cilent.entity';
import { CreateClientDTO, UpdateClientDTO } from './dtos/client.dto';
import { AppError } from '../../exceptions/AppError';
import logger from '../../utils/logger.util';
import { ResourceNotFoundException } from '../../exceptions/ResourceNotFound';

const log = logger.getLogger();

export class ClientService {
  constructor(private clientRepository: Repository<Client>) {
    this.clientRepository = getRepository<Client>(Client);
  }

  async findClientById(id: string) {
    try {
      const client = await this.clientRepository.findOne({
        where: {
          id,
        },
      });

      if (!client) {
        throw new ResourceNotFoundException('Could not find client.');
      }

      return client;
    } catch (error) {
      log.error('findClientById() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async createClient(createClientDTO: CreateClientDTO) {
    try {
      let client = this.clientRepository.create(createClientDTO);
      return await this.clientRepository.save(client);
    } catch (error) {
      log.error('createClient() error', error);
      throw new AppError(error.message, error.status);
    }
  }

  async updateClient(id: string, updateClientDTO: UpdateClientDTO) {
    try {
      await this.findClientById(id);
      await this.clientRepository.update({ id }, { ...updateClientDTO });
    } catch (error) {
      log.error('updateClient() error', error);
      throw new AppError(error.message, error.status);
    }
  }
}
