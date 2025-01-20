import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Projet } from './projet/projet';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjetDTO } from './projetDto/projetDTO';
import { TeamService } from '../teams/team.service';
import { UsersService } from '../users/users.service';
import { ProjetStatus } from './projet/ProjetStatus';

@Injectable()
export class ProjetsService {
    constructor(
        @InjectRepository(Projet) 
        private readonly projetRepository: Repository<Projet>,
        private readonly teamService: TeamService,
        private readonly usersService: UsersService,
    ){}

    async create(projetDto: ProjetDTO, currentUserId: number): Promise<Projet>{
        // Vérifier si l'utilisateur existe
        const user = await this.usersService.findById(currentUserId);
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'id ${currentUserId} non trouvé`);
        }

        // Vérifier si l'équipe existe
        if (!projetDto.teamId) {
            throw new BadRequestException("L'ID de l'équipe est requis");
        }

        const team = await this.teamService.findOne(projetDto.teamId);
        
        // Vérifier si l'utilisateur est le owner de l'équipe
        if (team.owner.id !== currentUserId) {
            throw new UnauthorizedException("Vous ne pouvez créer des projets que pour les équipes dont vous êtes le propriétaire");
        }

        // Créer le projet
        const projet = this.projetRepository.create({
            nom: projetDto.nom,
            description: projetDto.description,
            createdById: currentUserId,
            createdBy: user,
            teamId: projetDto.teamId,
            team: team,
            status: projetDto.status || ProjetStatus.EN_COURS
        });

        return await this.projetRepository.save(projet);
    }

    async update(id: number, projetDto: ProjetDTO, currentUserId: number): Promise<Projet>{
        const projet = await this.findById(id);
        
        // Verify project access
        await this.verifyProjectAccess(projet, currentUserId);

        const updatedProjet = await this.projetRepository.preload({
            id,
            ...projetDto,
        });
        
        if(!updatedProjet){
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }
        return await this.projetRepository.save(updatedProjet);
    }

    async remove(id: number, currentUserId: number): Promise<void>{
        const projet = await this.findById(id);
        
        // Verify project access
        await this.verifyProjectAccess(projet, currentUserId);

        const result = await this.projetRepository.delete(id);

        if(result.affected === 0){
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }
    }

    async findAll(currentUserId: number): Promise<Projet[] | { message: string }> {
        // 1. Récupération des équipes
        const userTeams = await this.teamService.findTeamsByUserId(currentUserId);
        
        // 2. Vérification si l'utilisateur a des équipes
        if (!userTeams || userTeams.length === 0) {
            return { message: "Vous n'avez pas de projet" };
        }

        // 3. Récupération des IDs des équipes
        const teamIds = userTeams.map(team => team.id);

        // 4. Requête pour récupérer les projets
        const projets = await this.projetRepository
            .createQueryBuilder('projet')
            .leftJoinAndSelect('projet.team', 'team')
            .leftJoinAndSelect('projet.createdBy', 'createdBy')
            .leftJoinAndSelect('team.members', 'members')
            .where('projet.teamId IN (:...teamIds)', { teamIds })
            .orWhere('projet.createdById = :currentUserId', { currentUserId })
            .getMany();

        // 5. Vérification si des projets existent
        if (!projets || projets.length === 0) {
            return { message: "Vous n'avez pas de projet" };
        }

        return projets;
    }

    async findById(id: number, currentUserId?: number): Promise<Projet> {
        // Récupérer le projet avec ses relations
        const projet = await this.projetRepository.findOne({
            where: { id },
            relations: ['team', 'team.members', 'createdBy'],
        });

        if (!projet) {
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }

        // Si un userId est fourni, vérifier l'accès
        if (currentUserId) {
            // Vérifier si l'utilisateur est le créateur
            if (projet.createdById === currentUserId) {
                return projet;
            }

            // Vérifier si l'utilisateur est membre de l'équipe
            const isMember = projet.team.members.some(member => member.id === currentUserId);
            if (!isMember) {
                throw new UnauthorizedException("Vous n'avez pas accès à ce projet");
            }
        }

        return projet;
    }

    private async verifyProjectAccess(projet: Projet, userId: number): Promise<void> {
        // Creator always has access
        if (projet.createdById === userId) {
            return;
        }

        // If project belongs to a team, check team membership
        if (projet.teamId) {
            const team = await this.teamService.findOne(projet.teamId);
            const isMember = team.members.some(member => member.id === userId);
            if (!isMember) {
                throw new UnauthorizedException("Vous n'avez pas accès à ce projet");
            }
        } else {
            // If project doesn't belong to a team and user is not creator
            throw new UnauthorizedException("Vous n'avez pas accès à ce projet");
        }
    }
}
