import supertest from 'supertest';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { app } from '../../../server';
import { UpdateUserDTO } from '../dtos/update-user.dto';

const { API_URL, AUTH_ENDPOINT } = process.env;
const AUTH_API_URL = API_URL.concat(AUTH_ENDPOINT);

export function registerUser(body: Partial<CreateUserDTO>) {
  const url = AUTH_API_URL.concat('/');
  return supertest(app).post(url).send(body);
}

export function updateUser(
  body: Partial<UpdateUserDTO>,
  userId?: string,
  token?: string
) {
  const url = AUTH_API_URL.concat(`/:${userId}`);
  return supertest(app)
    .patch(url)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

export function deleteUser(token?: string) {
  const url = AUTH_API_URL.concat('/');
  return supertest(app).delete(url).set('Authorization', `Bearer ${token}`);
}

export function getUser(userId?: string, token?: string) {
  const url = AUTH_API_URL.concat(`/:${userId}`);
  return supertest(app).get(url).set('Authorization', `Bearer ${token}`);
}
