import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user/user';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    searchUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [new User()];
      mockUsersService.searchUsers.mockResolvedValue(mockUsers);

      const result = await controller.searchUsers('test');

      expect(result).toBe(mockUsers);
      expect(service.searchUsers).toHaveBeenCalledWith('test');
    });
  });
});
