import { HttpStatus } from '../../enums/http-status.enum';
import { ResponseModel } from '../../models/utility/ResponseModel';
import logger from '../../utils/logger.util';
import { ClientService } from './client.service';
import { CreateClientDTO } from './dtos/client.dto';

const log = logger.getLogger();

export default class ClientController {
  constructor(private clientService: ClientService) {}

  async createClient(request: any) {
    try {
      const body = request.body as CreateClientDTO;
      const serviceResponse = await this.clientService.createClient(body);

      return new ResponseModel(
        HttpStatus.CREATED,
        'Successfully created file.',
        serviceResponse
      );
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || 'Failed to create client.',
        null
      );
    }
  }

  async updateClient(request: any) {
    try {
    } catch (error) {
      return new ResponseModel(
        error?.statusCode || HttpStatus.BAD_REQUEST,
        error?.message || 'Failed to update client.',
        null
      );
    }
  }
}
