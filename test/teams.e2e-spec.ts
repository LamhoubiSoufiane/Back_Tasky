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

  describe('/teams/:id/members (GET)', () => {
    let teamId: number;
    let newMemberId: number;

    beforeAll(async () => {
      // Créer une équipe pour les tests
      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team for Members List',
          memberIds: [userId],
        });
      teamId = teamResponse.body.id;

      // Créer un autre utilisateur et l'ajouter comme membre
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

      // Ajouter le nouveau membre à l'équipe
      await request(app.getHttpServer())
        .post(`/teams/${teamId}/members/${newMemberId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('devrait retourner la liste des membres avec authentification', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2); // Au moins le propriétaire et le nouveau membre
      expect(response.body.some((member) => member.id === userId)).toBe(true);
      expect(response.body.some((member) => member.id === newMemberId)).toBe(
        true,
      );
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer()).get(
        `/teams/${teamId}/members`,
      );
      expect(response.status).toBe(401);
    });

    it('devrait retourner 404 pour une équipe inexistante', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/999999/members')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('/teams/user/:userId (GET)', () => {
    let teamId1: number;
    let teamId2: number;
    let otherUserId: number;

    beforeAll(async () => {
      // Créer un autre utilisateur
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `other${Date.now()}@test.com`,
          password: 'password123',
          username: `otheruser${Date.now()}`,
          nom: 'Other',
          prenom: 'User',
        });
      otherUserId = otherUserResponse.body.id;

      // Créer deux équipes pour les tests
      const team1Response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team 1',
          memberIds: [userId, otherUserId],
        });
      teamId1 = team1Response.body.id;

      const team2Response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team 2',
          memberIds: [userId],
        });
      teamId2 = team2Response.body.id;
    });

    it("devrait retourner toutes les équipes dont l'utilisateur est membre", async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some((team) => team.id === teamId1)).toBe(true);
      expect(response.body.some((team) => team.id === teamId2)).toBe(true);
    });

    it("devrait retourner uniquement les équipes dont l'autre utilisateur est membre", async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/user/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body.some((team) => team.id === teamId1)).toBe(true);
      expect(response.body.some((team) => team.id === teamId2)).toBe(false);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer()).get(
        `/teams/user/${userId}`,
      );
      expect(response.status).toBe(401);
    });

    it('devrait retourner 404 pour un utilisateur inexistant', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/user/999999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('/teams/:teamId/members/:userId (DELETE)', () => {
    let teamId: number;
    let memberToRemoveId: number;
    let memberToken: string;

    beforeAll(async () => {
      // Créer une équipe pour les tests
      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Test Team for Member Removal',
          memberIds: [userId],
        });
      teamId = teamResponse.body.id;

      // Créer un autre utilisateur pour le retirer plus tard
      const memberResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `membertoremove${Date.now()}@test.com`,
          password: 'password123',
          username: `membertoremove${Date.now()}`,
          nom: 'Member',
          prenom: 'ToRemove',
        });
      memberToRemoveId = memberResponse.body.id;

      // Connecter le membre pour obtenir son token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: memberResponse.body.email,
          password: 'password123',
        });
      memberToken = loginResponse.body.access_token;

      // Ajouter le membre à l'équipe
      await request(app.getHttpServer())
        .post(`/teams/${teamId}/members/${memberToRemoveId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it("devrait retirer un membre de l'équipe avec authentification du chef d'équipe", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${memberToRemoveId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.members.some((member) => member.id === memberToRemoveId),
      ).toBe(false);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/teams/${teamId}/members/${memberToRemoveId}`,
      );
      expect(response.status).toBe(401);
    });

    it("devrait retourner 403 si un non-chef d'équipe tente de retirer un membre", async () => {
      // Créer une nouvelle équipe et ajouter un membre
      const newTeamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: 'Another Test Team',
          memberIds: [memberToRemoveId],
        });

      const response = await request(app.getHttpServer())
        .delete(`/teams/${newTeamResponse.body.id}/members/${userId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it("devrait retourner 400 si on tente de retirer le chef d'équipe", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('devrait retourner 404 pour une équipe inexistante', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/999999/members/${memberToRemoveId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });

    it("devrait retourner 404 pour un membre qui n'est pas dans l'équipe", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/999999`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });
});
