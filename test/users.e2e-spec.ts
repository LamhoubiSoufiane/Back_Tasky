import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabaseModule } from './test-database.module';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  // Augmenter le timeout pour les tests longs
  jest.setTimeout(30000);

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [TestDatabaseModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Créer un utilisateur de test
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        username: `testuser${Date.now()}`,
        nom: 'Test',
        prenom: 'User',
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('/users/search (GET)', () => {
    it('devrait rechercher des utilisateurs sans authentification', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('email');
        expect(response.body[0]).toHaveProperty('username');
        expect(response.body[0]).not.toHaveProperty('password');
      }
    });
  });
});
