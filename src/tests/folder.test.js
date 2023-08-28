const request = require('supertest');

const { app, connection } = require('../server');

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

describe('Folders', () => {
  it('should create, update and fetch folder', async () => {
    let a = await request(app)
      .post('/api/v1/auth')
      .send({ email: 'some@gmail.com', password: 'mmmmmmmm' });

    // Create Folder
    let response = await request(app)
      .post('/api/v1/folder')
      .set('Authorization', `Bearer: ${a.body.token}`);
    expect(response.statusCode).toEqual(201);
    expect(typeof a.body.token).toEqual('string');

    // Update Folder
    const { id } = response.data;
    response = await request(app)
      .put(`/api/v1/folder/${id}`)
      .set('Authorization', `Bearer: ${a.body.token}`)
      .send({
        name: 'Generic Folder Name',
      });
    expect(response.statusCode).toEqual(200);
    response = await request(app)
      .get(`/api/v1/folder/${id}`)
      .set('Authorization', `Bearer: ${a.body.token}`);
    expect(response.statusCode).toEqual(200);
  });

  it('should fetch non-empty list of folders', async () => {
    let a = await request(app)
      .post('/api/v1/auth')
      .send({ email: 'viktor.uche@gmail.com', password: 'mmmmmmmm' });

    let response = await request(app)
      .get(`/api/v1/folder`)
      .set('Authorization', `Bearer: ${a.body.token}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBeGreaterThan(0);
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
    expect(response.statusCode).toEqual(200);
  });
});

afterAll(async (done) => {
  connection.destroy();
  done();
});
