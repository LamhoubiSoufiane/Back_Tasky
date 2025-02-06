import { Test, TestingModule } from '@nestjs/testing';
import { ProjetsService } from './projets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Projet } from './projet/projet';
import { TeamService } from '../teams/team.service';
import { UsersService } from '../users/users.service';
import { ProjetStatus } from './projet/ProjetStatus';

describe('ProjetsService', () => {
  let service: ProjetsService;

  const mockProjetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockTeamService = {
    findOne: jest.fn(),
    findTeamsByUserId: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjetsService,
        {
          provide: getRepositoryToken(Projet),
          useValue: mockProjetRepository,
        },
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ProjetsService>(ProjetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project with team', async () => {
      const projetDto = {
        nom: 'Test Project',
        description: 'Test Description',
        teamId: 1,
        status: ProjetStatus.EN_COURS,
      };

      const user = { id: 1, username: 'testuser' };
      const team = { 
        id: 1, 
        members: [user],
        projets: [],
      };

      mockUsersService.findById.mockResolvedValue(user);
      mockTeamService.findOne.mockResolvedValue(team);
      mockProjetRepository.create.mockReturnValue({ ...projetDto, createdBy: user, team });
      mockProjetRepository.save.mockResolvedValue({ id: 1, ...projetDto, createdBy: user, team });

      const result = await service.create(projetDto, 1);

      expect(result).toBeDefined();
      expect(result.teamId).toBe(projetDto.teamId);
      expect(result.createdBy).toBe(user);
    });
  });

  // Add more test cases for other methods...
});
