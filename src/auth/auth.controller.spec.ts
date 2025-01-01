import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };
      const user = { id: 1, email: loginDto.email };
      const expectedResult = {
        access_token: 'token',
        refresh_token: 'refresh',
      };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toBe(expectedResult);
      expect(service.validateUser).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledWith(user);
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Email Adress or Password is incorrect',
      );
    });
  });

  describe('register', () => {
    it('devrait inscrire un nouvel utilisateur', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
        nom: 'Test',
        prenom: 'User',
      };
      const expectedResult = { id: 1, ...registerDto };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
