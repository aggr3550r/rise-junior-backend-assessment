import supertest from 'supertest';
import { app } from '../../../server';
import { UploadFileDTO } from '../dtos/upload-file.dto';
import { UpdateFileDTO } from '../dtos/update-file.dto';
import { ReviewFileDTO } from '../dtos/review-file.dto';
import { LoginDTO } from '../../user/dtos/login-dto';

const { API_URL, FILE_ENDPOINT } = process.env;
const FILE_API_URL = API_URL.concat(FILE_ENDPOINT);

export function uploadFile(body: Partial<UploadFileDTO>, token?: string) {
  const url = FILE_API_URL.concat('/upload');
  return supertest(app)
    .post(url)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

export function updateFile(body: Partial<UpdateFileDTO>, token?: string) {
  const url = FILE_API_URL.concat('/');
  return supertest(app)
    .put(url)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

export function downloadFile(fileId?: string, token?: string) {
  const url = FILE_API_URL.concat(`/:${fileId}/download`);
  return supertest(app).get(url).set('Authorization', `Bearer ${token}`);
}

export function getFile(fileId?: string, token?: string) {
  const url = FILE_API_URL.concat(`/:${fileId}`);
  return supertest(app).get(url).set('Authorization', `Bearer ${token}`);
}

export function reviewFile(
  body: Partial<ReviewFileDTO>,
  fileId?: string,
  token?: string
) {
  const url = FILE_API_URL.concat(`/:${fileId}`);
  return supertest(app)
    .patch(url)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

export function getFilesForUser(token?: string) {
  const url = FILE_API_URL.concat('/');
  return supertest(app).get(url).set('Authorization', `Bearer ${token}`);
}
