import { BaseDTO } from '../../../dto/base.dto';

export class ClientConfigDTO extends BaseDTO {
  compress: boolean;
  maxFileSize?: number;
  minFileSize: number;
}
export class CreateClientConfigDTO {
  compress?: boolean;
  maxFileSize?: number;
  minFileSize?: number;
}
export class UpdateClientConfigDTO extends CreateClientConfigDTO {
  is_active?: boolean;
}
