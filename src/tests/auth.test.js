const request = require('supertest');
const { app, connection } = require('../server');

describe('Register', () => {
  it('should fail because user full_name is missing', async () => {
    const response = await request(app).post('/api/v1/user').send({
      email: 'viktor.uche.07@gmail.com',
      password: 'testpassword',
      role: 'admin',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should fail because user password is less than 8 characters long', async () => {
    const response = await request(app).post('/a[i/v1/user').send({
      full_name: 'Victor Uche',
      email: 'viktor.uche.07@gmail.com',
      password: '7777',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should fail because email was not provided', async () => {
    const response = await request(app).post('/a[i/v1/user').send({
      full_name: 'Victor Uche',
      password: '7777',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should register a new user', async () => {
    const response = await request(app).post('/api/v1/user').send({
      full_name: 'Viktor Dean',
      email: 'viktor.uche.07@gmail.com',
      password: 'testpassword',
      role: 'admin',
    });

    expect(response.statusCode).toEqual(201);
  });

  it('should update a user', async () => {
    const userId = '1';

    const response = await request(app).patch(`/api/v1/user/${userId}`).send({
      name: 'Updated User',
      role: 'mmmmmmmm',
    });

    expect(response.statusCode).toEqual(200);
  });

  it('should get a user by ID', async () => {
    const userId = '1';

    const response = await request(app).get(`/api/v1/user/${userId}`);

    expect(response.statusCode).toEqual(200);
  });
});

describe('Login', () => {
  it('should log user in and send auth token', async () => {
    const response = await request(app).post(`/api/v1/user`).send({
      email: 'viktor.uche.07@gmail.com',
      password: 'mmmmmmmm',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.token).to;
  });

  it('should get a user by ID', async () => {
    const userId = '1';

    const response = await request(app).get(`/api/v1/user/${userId}`);

    expect(response.statusCode).toEqual(200);
  });
});

describe('Fetch user details', () => {
  it('should fail because user is not authenticated', async () => {
    const response = await request(app).get('/api/v1/user');

    expect(response.statusCode).toEqual(401);
  });
  it('should pass because user is authenticated', async () => {
    const authToken = await request(app)
      .post('/api/v1/auth')
      .send({
        email: 'viktor.uche.07@gmail.com',
        password: 'mmmmmmmm',
      })
      .then((response) => response.body.token);
    const response = await request(app)
      .get('/api/v1/user')
      .set('Authorization', `Bearer: ${authToken}`);

    expect(response.statusCode).toEqual(200);
    expect(typeof authToken).toEqual('string');
  });
});

afterAll(async (done) => {
  connection.close();
  done();
});
