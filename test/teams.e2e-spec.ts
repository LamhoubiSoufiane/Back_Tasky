import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabaseModule } from './test-database.module';

describe('Teams Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
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
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        username: `testuser${Date.now()}`,
        nom: 'Test',
        prenom: 'User',
      });

    userId = registerResponse.body.id;

    // Obtenir le token d'authentification
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerResponse.body.email,
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('/teams (POST)', () => {
    it('devrait créer une nouvelle équipe avec authentification', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team',
          memberIds: [userId],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nom).toBe('Test Team');
      expect(response.body.owner.id).toBe(userId);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .send({
          nom: 'Test Team',
          memberIds: [userId],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('/teams/:id (GET)', () => {
    let teamId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team for Get',
          memberIds: [userId],
        });
      teamId = response.body.id;
    });

    it('devrait retourner une équipe par son ID avec authentification', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', teamId);
      expect(response.body).toHaveProperty('nom');
      expect(response.body.owner.id).toBe(userId);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer()).get(
        `/teams/${teamId}`,
      );
      expect(response.status).toBe(401);
    });

    it('devrait retourner 404 pour une équipe inexistante', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/999999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('/teams/:id/members (POST)', () => {
    let teamId: number;
    let newMemberId: number;

    beforeAll(async () => {
      // Créer une équipe pour les tests
      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team for Members',
          memberIds: [userId],
        });
      teamId = teamResponse.body.id;

      // Créer un autre utilisateur pour l'ajouter comme membre
      const memberResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `member${Date.now()}@test.com`,
          password: 'password123',
          username: `member${Date.now()}`,
          nom: 'Member',
          prenom: 'Test',
        });
      newMemberId = memberResponse.body.id;
    });

    it("devrait ajouter un membre à l'équipe avec authentification", async () => {
      const response = await request(app.getHttpServer())
        .post(`/teams/${teamId}/members/${newMemberId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.members).toContainEqual(
        expect.objectContaining({ id: newMemberId }),
      );
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer()).post(
        `/teams/${teamId}/members/${newMemberId}`,
      );
      expect(response.status).toBe(401);
    });
  });
});
