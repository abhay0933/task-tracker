const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

beforeAll(async () => {
  // Clean up test users
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test-auth.com' } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test-auth.com' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('should create a user and return a token', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'alice@test-auth.com',
      name: 'Alice',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test-auth.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'alice@test-auth.com',
      name: 'Alice Again',
      password: 'password123',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'not-an-email',
      name: 'Bob',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe('email');
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'bob@test-auth.com',
      name: 'Bob',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject short name', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'charlie@test-auth.com',
      name: 'A',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'name')).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  it('should return a token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@test-auth.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test-auth.com');
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@test-auth.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should reject unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test-auth.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});
