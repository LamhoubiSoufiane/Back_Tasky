import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

describe('TeamController', () => {
  let controller: TeamController;
  let service: TeamService;
  const mockReq = { user: { userId: 1 } };

  const mockTeamService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
      ],
    }).compile();

    controller = module.get<TeamController>(TeamController);
    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a team', async () => {
      const teamDto = {
        nom: 'Test Team',
        ownerId: 1,
        memberIds: [1, 2],
      };
      const expectedTeam = {
        id: 1,
        ...teamDto,
      };

      mockTeamService.create.mockResolvedValue(expectedTeam);

      const result = await controller.create(mockReq, teamDto);

      expect(result).toBe(expectedTeam);
      expect(service.create).toHaveBeenCalledWith(teamDto, mockReq.user.userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of teams', async () => {
      const expectedTeams = [
        { id: 1, nom: 'Team 1' },
        { id: 2, nom: 'Team 2' },
      ];

      mockTeamService.findAll.mockResolvedValue(expectedTeams);

      const result = await controller.findAll();

      expect(result).toBe(expectedTeams);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a team', async () => {
      const expectedTeam = { id: 1, nom: 'Team 1' };

      mockTeamService.findOne.mockResolvedValue(expectedTeam);

      const result = await controller.findOne('1');

      expect(result).toBe(expectedTeam);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const teamDto = {
        nom: 'Updated Team',
        ownerId: 1,
        memberIds: [1, 2, 3],
      };
      const expectedTeam = {
        id: 1,
        ...teamDto,
      };

      mockTeamService.update.mockResolvedValue(expectedTeam);

      const result = await controller.update(mockReq, '1', teamDto);

      expect(result).toBe(expectedTeam);
      expect(service.update).toHaveBeenCalledWith(
        1,
        teamDto,
        mockReq.user.userId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a team', async () => {
      await controller.remove(mockReq, '1');

      expect(service.remove).toHaveBeenCalledWith(1, mockReq.user.userId);
    });
  });
});
