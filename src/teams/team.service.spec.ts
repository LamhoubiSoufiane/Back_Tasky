import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Team } from './team/team.entity';
import { Repository } from 'typeorm';
import { TeamDTO } from './dto/team.dto';
import { User } from '../users/user/user';

describe('TeamService', () => {
  let service: TeamService;
  let teamRepository: Repository<Team>;
  let userRepository: Repository<User>;

  const mockTeamRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findByIds: jest.fn(),
    save: jest.fn(),
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
    it('devrait créer une nouvelle équipe avec un propriétaire et des membres', async () => {
      const teamDto: TeamDTO = {
        nom: 'Test Team',
        memberIds: [1, 2],
      };

      const owner = { id: 1, username: 'owner' };
      const members = [owner, { id: 2, username: 'member' }];

      mockUserRepository.findOne.mockResolvedValue(owner);
      mockUserRepository.findByIds.mockResolvedValue(members);
      mockTeamRepository.save.mockResolvedValue({
        id: 1,
        nom: teamDto.nom,
        owner,
        members,
      });

      const result = await service.create(teamDto, 1);

      expect(result.nom).toBe(teamDto.nom);
      expect(result.owner).toBe(owner);
      expect(result.members).toBe(members);
    });

    it("devrait échouer si le propriétaire n'existe pas", async () => {
      const teamDto: TeamDTO = {
        nom: 'Test Team',
        memberIds: [1, 2],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(teamDto, 1)).rejects.toThrow(
        'User with ID 1 not found',
      );
    });
  });
});
