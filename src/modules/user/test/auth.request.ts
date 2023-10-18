import supertest from 'supertest';
import { app } from '../../../server';
import { LoginDTO } from '../dtos/login-dto';

const { API_URL, AUTH_ENDPOINT } = process.env;
const AUTH_API_URL = API_URL.concat(AUTH_ENDPOINT);

export function login(body: Partial<LoginDTO>) {
  const url = AUTH_API_URL.concat('/');
  return supertest(app).post(url).send(body);
}
