// backend/tests/auth.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.grade.deleteMany();
    await prisma.enrollmentSubject.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const role = await prisma.role.create({
        data: { name: 'student' }
      });

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          roleId: role.id,
          status: 'active'
        }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should reject inactive accounts', async () => {
      const role = await prisma.role.create({
        data: { name: 'student' }
      });

      await prisma.user.create({
        data: {
          email: 'inactive@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          roleId: role.id,
          status: 'inactive'
        }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      // Create test user and get token
      const role = await prisma.role.create({
        data: { name: 'student' }
      });

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          roleId: role.id,
          status: 'active'
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
