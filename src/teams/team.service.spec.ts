import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamService } from './team.service';
import { Team } from './team/team.entity';
import { User } from '../users/user/user';
import { NotFoundException } from '@nestjs/common';

describe('TeamService', () => {
  let service: TeamService;
  let teamRepository: Repository<Team>;
  let userRepository: Repository<User>;

  const mockTeamRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a team', async () => {
      const teamDto = {
        nom: 'Test Team',
        ownerId: 1,
        memberIds: [1, 2],
      };

      const owner = { id: 1, nom: 'Owner' };
      const members = [
        { id: 1, nom: 'Member 1' },
        { id: 2, nom: 'Member 2' },
      ];

      mockUserRepository.findOne.mockResolvedValue(owner);
      mockUserRepository.findByIds.mockResolvedValue(members);
      mockTeamRepository.save.mockResolvedValue({
        ...teamDto,
        owner,
        members,
      });

      const result = await service.create(teamDto);

      expect(result.nom).toBe(teamDto.nom);
      expect(result.owner).toBe(owner);
      expect(result.members).toBe(members);
    });

    it('should throw NotFoundException if owner not found', async () => {
      const teamDto = {
        nom: 'Test Team',
        ownerId: 999,
        memberIds: [1],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(teamDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of teams', async () => {
      const teams = [
        { id: 1, nom: 'Team 1' },
        { id: 2, nom: 'Team 2' },
      ];
      mockTeamRepository.find.mockResolvedValue(teams);

      const result = await service.findAll();

      expect(result).toBe(teams);
    });
  });

  describe('findOne', () => {
    it('should return a team', async () => {
      const team = { id: 1, nom: 'Team 1' };
      mockTeamRepository.findOne.mockResolvedValue(team);

      const result = await service.findOne(1);

      expect(result).toBe(team);
    });

    it('should throw NotFoundException if team not found', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
