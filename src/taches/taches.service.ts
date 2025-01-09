import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    InternalServerErrorException,
    BadRequestException,
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user/user';
import { Location } from '../locations/location/location';
import { Tache } from './tache/tache';
import { TacheDTO } from './tacheDto/tacheDTO';
import { Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

@Injectable()
export class TachesService {
    constructor(
        @InjectRepository(Tache)
        private readonly tacheRepository: Repository<Tache>,
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
      ) {}

      async create(tacheDto: TacheDTO): Promise<Tache> {
      try
      {
        const { memberId, locations, ...tacheData } = tacheDto;
      
        // Create the Tache entity
        const tache = new Tache();
        tache.nom = tacheData.nom;
        tache.description = tacheData.description;  // Vérifier le nom du champ
        tache.startDate = tacheData.startDate;
        tache.endDate = tacheData.endDate;
        tache.status = tacheData.status;
        tache.priorite = tacheData.priorite;
      
        // Find the member (user) by ID
        const member = await this.userRepository.findOne({ where: { id: memberId } });
        if (!member) {
          throw new NotFoundException(`User with ID ${memberId} not found`);
        }
        tache.member = member;
      
        // Handle the task's locations
        if (locations) {
          const savedLocations = await Promise.all(
            locations.map(async (locationDto) => {
              const location = this.locationRepository.create(locationDto);
              return this.locationRepository.save(location);
            }),
          );
          tache.locations = savedLocations;
        }
      
        // Save the task to the database
        return await this.tacheRepository.save(tache);
    } catch (error) {
        // Enregistrer l'erreur dans les logs pour aider au diagnostic
        console.error('Erreur lors de la création de la tâche:', error);
        throw new InternalServerErrorException('Une erreur est survenue lors de la création de la tâche');
      }
    
    }

    async findOne(id: number): Promise<Tache> {
        try
        {
            const tache = await this.tacheRepository.findOne({ where: {id}, relations: ['locations', 'member'] })
            if(!tache) {
                throw new NotFoundException(`Tache with ID ${id} not found`);
            }
            return tache;
        } catch(error){
            console.error('Erreur lors de la récupération de la tâche:', error);
        throw new InternalServerErrorException('Une erreur est survenue lors de la récupération de la tâche');
        }
    }

    async findAll(): Promise<Tache[]> {
        try {
          return await this.tacheRepository.find({ relations: ['locations', 'member'] });
        } catch (error) {
          console.error('Erreur lors de la récupération des tâches:', error);
          throw new InternalServerErrorException('Une erreur est survenue lors de la récupération des tâches');
        }
    }

      // Update a task by ID
  async update(id: number, tacheDto: TacheDTO): Promise<Tache> {
    try {
      const tache = await this.findOne(id);

      const { memberId, locations, ...tacheData } = tacheDto;

      // Update the task entity
      tache.nom = tacheData.nom;
      tache.description = tacheData.description;
      tache.startDate = tacheData.startDate;
      tache.endDate = tacheData.endDate;
      tache.status = tacheData.status;
      tache.priorite = tacheData.priorite;

      // Update the member (user) if necessary
      if (memberId) {
        const member = await this.userRepository.findOne({ where: { id: memberId } });
        if (!member) {
          throw new NotFoundException(`User with ID ${memberId} not found`);
        }
        tache.member = member;
      }

      // Handle the task's locations
      if (locations) {
        // Remove old locations and save the new ones
        await this.locationRepository.delete({ tache: tache });
        const savedLocations = await Promise.all(
          locations.map(async (locationDto) => {
            const location = this.locationRepository.create(locationDto);
            return this.locationRepository.save(location);
          }),
        );
        tache.locations = savedLocations;
      }

      // Save the updated task to the database
      return await this.tacheRepository.save(tache);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw new InternalServerErrorException('Une erreur est survenue lors de la mise à jour de la tâche');
    }
  }


  // Delete a task by ID
  async remove(id: number): Promise<void> {
    try {
      const tache = await this.findOne(id);
      await this.tacheRepository.remove(tache);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw new InternalServerErrorException('Une erreur est survenue lors de la suppression de la tâche');
    }
  }


  async assignTacheToUser(tacheId: number, memberId: number): Promise<Tache> {
    // Rechercher la tâche par son ID
    const tache = await this.tacheRepository.findOne({ where: { id: tacheId } });
    if (!tache) {
      throw new NotFoundException(`Tâche avec l'ID ${tacheId} non trouvée`);
    }

    // Rechercher l'utilisateur par son ID
    const user = await this.userRepository.findOne({ where: { id: memberId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${memberId} non trouvé`);
    }

    // Assigner le membre à la tâche
    tache.member = user;

    // Sauvegarder la tâche mise à jour
    return await this.tacheRepository.save(tache);
  }

  async filterTaches(status?: string, startDate?: Date, endDate?: Date): Promise<Tache[]> {
    const queryBuilder = this.tacheRepository.createQueryBuilder('tache');
  
    if (status) {
      queryBuilder.andWhere('tache.status = :status', { status });
    }
  
    if (startDate) {
      queryBuilder.andWhere('tache.startDate >= :startDate', { startDate });
    }
  
    if (endDate) {
      queryBuilder.andWhere('tache.endDate <= :endDate', { endDate });
    }
  
    try {
      // Exécution de la requête
      const taches = await queryBuilder.getMany();
      return taches;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête:', error);
      throw new Error('Une erreur est survenue lors du filtrage des tâches');
    }
  }
  
  

}      

