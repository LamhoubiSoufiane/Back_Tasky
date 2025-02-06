import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/user';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  // Mock du QueryBuilder pour simuler les opérations de requête complexes
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(), // Simule les jointures et retourne this pour le chaînage
    where: jest.fn().mockReturnThis(), // Simule les conditions WHERE
    select: jest.fn().mockReturnThis(), // Simule la sélection des champs
    getMany: jest.fn(), // Simule la récupération des résultats
  };

  // Mock du repository TypeORM avec les méthodes nécessaires
  const mockRepository = {
    findOne: jest.fn(), // Pour rechercher un utilisateur
    save: jest.fn(), // Pour sauvegarder un utilisateur
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder), // Pour créer des requêtes complexes
  };

  // Configuration initiale avant chaque test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Vérifie que le service est bien défini
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests de la fonction de recherche d'utilisateurs
  describe('searchUsers', () => {
    it('devrait rechercher des utilisateurs par terme de recherche', async () => {
      // Prépare les données de test
      const mockUsers = [
        {
          id: 1,
          username: 'testuser',
          email: 'test@test.com',
          nom: 'Test',
          prenom: 'User',
        },
      ];
      // Configure le mock pour retourner les utilisateurs de test
      mockQueryBuilder.getMany.mockResolvedValue(mockUsers);

      // Exécute la recherche
      const result = await service.searchUsers('test');

      // Vérifie le résultat
      expect(result).toBe(mockUsers);

      // Vérifie que le QueryBuilder a été utilisé correctement
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');

      // Vérifie que les jointures ont été faites correctement
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.teams',
        'team',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'team.owner',
        'owner',
      );

      // Vérifie que la condition de recherche est correcte
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(user.username) LIKE LOWER(:searchTerm) OR LOWER(user.email) LIKE LOWER(:searchTerm)',
        { searchTerm: '%test%' },
      );
    });
  });
});
