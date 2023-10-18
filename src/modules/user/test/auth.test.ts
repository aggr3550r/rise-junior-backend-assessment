import { login } from './auth.request';

describe('LoginHandler', () => {
  it('should fail if body not provided', async () => {
    const response = await login({});

    expect(response.status).toBe(400);
  });

  it('should fail if email is not found', async () => {
    const response = await login({
      email: 'gafe_auth_404@gafe.co',
      password: 'gafe_dev_password',
    });

    expect(response.status).toBe(404);
  });

  it('should fail if password does not match', async () => {
    const response = await login({
      email: 'gafe_auth_user@gafe.co',
      password: 'gafe_dev_wrong_password',
    });

    expect(response.status).toBe(401);
  });

  it('should fail if user is not verified', async () => {
    const response = await login({
      email: 'gafe_unverified_user@gafe.co',
      password: 'gafe_dev_password',
    });

    expect(response.status).toBe(403);
  });

  it('should succeed if user is verified', async () => {
    const response = await login({
      email: 'gafe_auth_user@gafe.co',
      password: 'gafe_dev_password',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
  });
});
