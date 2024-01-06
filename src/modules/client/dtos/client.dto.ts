import { BaseDTO } from '../../../dto/base.dto';

export class ClientDTO extends BaseDTO {
  name: string;
  email: string;
  clientKey: string;
  metadata: string;
  config: string;
}

export class CreateClientDTO {
  name?: string;
  email?: string;
  metadata?: string;
  config?: string;
}

export class UpdateClientDTO extends CreateClientDTO {
  is_active?: boolean;
}
