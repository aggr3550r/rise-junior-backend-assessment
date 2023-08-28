const request = require('supertest');

const { app, connection } = require('../server');
const { FileFlag } = require('../enums/file-flag.enum');

let authToken = null;

beforeAll(async (done) => {
  await request(app).post('/api/v1/user').send({
    full_name: 'Victor Uche',
    email: 'some@gmail.com',
    password: 'passkey',
    role: 'admin',
  });

  authToken = await request(app)
    .post('/api/v1/auth')
    .send({
      email: 'some@gmail.com',
      password: 'mmmmmmmm',
    })
    .then((response) => response.body.token);

  done();
});

describe('Files', () => {
  it('should get a file, review a file and download a file', async () => {
    let a = await request(app)
      .post('/api/v1/auth')
      .send({ email: 'some@gmail.com', password: 'mmmmmmmm' });

    // Get A File
    let response = await request(app)
      .post(`/api/v1/file/2`)
      .set('Authorization', `Bearer: ${a.body.token}`);
    expect(response.statusCode).toEqual(400);
    expect(typeof a.body.token).toEqual('string');
  });
  // Review A File
  it('should fail because there is no file with that id yet ', async () => {
    const { id } = response.data;
    response = await request(app)
      .put(`/api/v1/file/${id}`)
      .set('Authorization', `Bearer: ${a.body.token}`)
      .send({
        file_flag: FileFlag.SAFE,
        admin_review_comment: 'This is okay',
      });
    expect(response.statusCode).toEqual(400);
    expect(response.statusCode).toEqual(400);
  });

  it('should fail to add file to folder because file does not yet exist', async () => {
    let a = await request(app)
      .post('/api/v1/auth')
      .send({ email: 'viktor.uche@gmail.com', password: 'mmmmmmmm' });
    let fileResponse = await request(app).get(`/api/v1/file`);
    let { fileId } = fileResponse.data;

    let response = await request(app)
      .put(`/api/v1/folder/1/${fileId}`)
      .set('Authorization', `Bearer: ${a.body.token}`);
    expect(response.statusCode).toEqual(400);
  });

  it('should fail to dowload file becuase file Id is non-existent', async () => {
    let a = await request(app)
      .post('/api/v1/auth')
      .send({ email: 'viktor.uche@gmail.com', password: 'mmmmmmmm' });
    let fileResponse = await request(app)
      .get(`/api/v1/file`)
      .set('Authorization', `Bearer: ${a.body.token}`);

    expect(fileResponse.statusCode).toEqual(400);
  });
});

afterAll(async (done) => {
  connection.close();
  done();
});
