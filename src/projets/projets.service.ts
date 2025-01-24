import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projet } from './projet/projet';
import { ProjetDTO } from './projetDto/projetDTO';
import { ProjetMapper } from './mapper/projetMapper.mapper';
import { Team } from '../teams/team/team.entity';
import { Task } from '../tasks/bo/task';
import { Aide } from '../aides/aide/aide.entity';

@Injectable()
export class ProjetsService {
  constructor(
    @InjectRepository(Projet)
    private readonly projetRepository: Repository<Projet>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Aide)
    private readonly aideRepository: Repository<Aide>
  ) {}

  async create(projetDTO: ProjetDTO, userId: number): Promise<ProjetDTO> {
    if (projetDTO.idTeam) {
      const isTeamMember = await this.isUserTeamMember(userId, projetDTO.idTeam);
      if (!isTeamMember) {
        throw new UnauthorizedException('User is not a member of the specified team');
      }
    }
    const projetMapper = new ProjetMapper();
    const projet = projetMapper.toBO(projetDTO);
    const savedProjet = await this.projetRepository.save(projet);
    return projetMapper.toDTO(savedProjet);
  }

  private async isUserTeamMember(userId: number, teamId: number): Promise<boolean> {
    const team = await this.teamRepository.findOne({
      where: [
        { id: teamId, owner: { id: userId } },
        { id: teamId, members: { id: userId } }
      ],
      relations: ['owner', 'members']
    });
    return !!team;
  }

  private async isUserTeamOwner(userId: number, teamId: number): Promise<boolean> {
    const team = await this.teamRepository.findOne({
      where: { 
        id: teamId,
        owner: { id: userId }
      },
      relations: ['owner']
    });
    return !!team;
  }

  async findAll(currentUserId: number): Promise<ProjetDTO[]> {
    // Find all teams where the user is a member or owner
    const teams = await this.teamRepository.find({
      where: [
        { owner: { id: currentUserId } },
        { members: { id: currentUserId } }
      ],
      relations: ['projets', 'owner', 'members']
    });

    // Get all projects from these teams
    const projects = teams.flatMap(team => team.projets || []);
    return projects.map(projet => new ProjetMapper().toDTO(projet));
  }

  async findById(id: number, currentUserId: number): Promise<ProjetDTO> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'team.members']
    });

    if (!projet) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const isAuthorized = await this.isUserTeamMember(currentUserId, projet.team.id);
    if (!isAuthorized) {
      throw new UnauthorizedException('You do not have access to this project');
    }

    return new ProjetMapper().toDTO(projet);
  }

  async findProjectsByMemberId(memberId: number, currentUserId: number): Promise<ProjetDTO[]> {
    // Find all teams where the target user is a member
    const teams = await this.teamRepository.find({
      where: [
        { owner: { id: memberId } },
        { members: { id: memberId } }
      ],
      relations: ['projets', 'owner', 'members']
    });

    // Verify if current user has access to these teams
    const accessibleTeams = await Promise.all(
      teams.map(async team => {
        const hasAccess = await this.isUserTeamMember(currentUserId, team.id);
        return hasAccess ? team : null;
      })
    );

    // Get projects only from teams where current user has access
    const projects = accessibleTeams
      .filter(team => team !== null)
      .flatMap(team => team.projets || []);

    return projects.map(projet => new ProjetMapper().toDTO(projet));
  }

  async getProjetsByTeamId(teamId: number, currentUserId: number): Promise<ProjetDTO[]> {
    const isAuthorized = await this.isUserTeamMember(currentUserId, teamId);
    if (!isAuthorized) {
      throw new UnauthorizedException('You do not have access to projects in this team');
    }

    const projets = await this.projetRepository.find({
      where: { team: { id: teamId } },
      relations: ['team', 'team.owner', 'tasks']
    });

    return projets.map(projet => new ProjetMapper().toDTO(projet));
  }

  async update(id: number, projetDTO: ProjetDTO, currentUserId: number): Promise<ProjetDTO> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'tasks']
    });
    if (!projet) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const isAuthorized = await this.isUserTeamOwner(currentUserId, projet.team.id);
    if (!isAuthorized) {
      throw new UnauthorizedException('Only team owners can update projects');
    }

    const projetMapper = new ProjetMapper();
    const updatedProjet = projetMapper.toBO(projetDTO);
    updatedProjet.id = id;

    const savedProjet = await this.projetRepository.save(updatedProjet);
    return projetMapper.toDTO(savedProjet);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'tasks', 'tasks.aides']
    });
    
    if (!projet) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const isAuthorized = await this.isUserTeamOwner(currentUserId, projet.team.id);
    if (!isAuthorized) {
      throw new UnauthorizedException('Only team owners can delete projects');
    }

    // Delete tasks and their aides
    if (projet.tasks && projet.tasks.length > 0) {
      for (const task of projet.tasks) {
        // Delete aides first if they exist
        if (task.aides && task.aides.length > 0) {
          await this.aideRepository.remove(task.aides);
        }
        // Delete the task
        await this.taskRepository.remove(task);
      }
    }

    // Finally delete the project
    await this.projetRepository.remove(projet);
  }
}
