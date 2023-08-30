import { Repository, getRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import UserService from '../user.service';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UserRole } from '../../../enums/user-role.enum';
import connection from '../../../database/connection';
import { afterEach, beforeEach, describe, it } from 'node:test';

let userRepository: Repository<User>;
let userService: UserService;

describe('User Service', () => {
  beforeEach(() => {
    const dbConnect = connection.create();
    userRepository = getRepository(User);
    userService = new UserService(userRepository);
  });

  afterEach(async () => {
    await connection.clear();
    await connection.close();
  });

  it('should create a user', async () => {
    let userData: CreateUserDTO = {
      email: 'some@gmail.com',
      password: 'killshot',
      full_name: 'Victor Uche',
      role: UserRole.ADMIN,
    };

    let userResponse = await userService.createUser(userData);
  });
});
