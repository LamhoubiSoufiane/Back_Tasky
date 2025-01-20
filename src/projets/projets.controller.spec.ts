import { Test, TestingModule } from '@nestjs/testing';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';

describe('ProjetsController', () => {
  let controller: ProjetsController;
  let service: ProjetsService;
  const mockReq = { user: { userId: 1 } };

  const mockProjetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjetsController],
      providers: [
        {
          provide: ProjetsService,
          useValue: mockProjetsService,
        },
      ],
    }).compile();

    controller = module.get<ProjetsController>(ProjetsController);
    service = module.get<ProjetsService>(ProjetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const projetDto = {
        nom: 'Test Project',
        description: 'Test Description',
        teamId: 1,
      };
      const expectedProjet = {
        id: 1,
        ...projetDto,
        createdById: 1,
      };

      mockProjetsService.create.mockResolvedValue(expectedProjet);

      const result = await controller.create(mockReq, projetDto);

      expect(result).toBe(expectedProjet);
      expect(service.create).toHaveBeenCalledWith(projetDto, mockReq.user.userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const expectedProjets = [
        { id: 1, nom: 'Project 1' },
        { id: 2, nom: 'Project 2' },
      ];

      mockProjetsService.findAll.mockResolvedValue(expectedProjets);

      const result = await controller.findAll(mockReq);

      expect(result).toBe(expectedProjets);
      expect(service.findAll).toHaveBeenCalledWith(mockReq.user.userId);
    });
  });

  describe('findOne', () => {
    it('should return a project', async () => {
      const expectedProjet = { id: 1, nom: 'Project 1' };

      mockProjetsService.findById.mockResolvedValue(expectedProjet);

      const result = await controller.findOne(mockReq, '1');

      expect(result).toBe(expectedProjet);
      expect(service.findById).toHaveBeenCalledWith(1, mockReq.user.userId);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const projetDto = {
        nom: 'Updated Project',
        description: 'Updated Description',
      };
      const expectedProjet = {
        id: 1,
        ...projetDto,
      };

      mockProjetsService.update.mockResolvedValue(expectedProjet);

      const result = await controller.update(mockReq, '1', projetDto);

      expect(result).toBe(expectedProjet);
      expect(service.update).toHaveBeenCalledWith(
        1,
        projetDto,
        mockReq.user.userId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      await controller.remove(mockReq, '1');

      expect(service.remove).toHaveBeenCalledWith(1, mockReq.user.userId);
    });
  });
});
