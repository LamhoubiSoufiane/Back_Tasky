import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projet } from './projet/projet';
import { ProjetDTO } from './projetDto/projetDTO';
import { ProjetMapper } from './mapper/projetMapper.mapper';
import { Team } from '../teams/team/team.entity';

@Injectable()
export class ProjetsService {
  constructor(
    @InjectRepository(Projet)
    private readonly projetRepository: Repository<Projet>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(projetDTO: ProjetDTO): Promise<ProjetDTO> {
    const projetMapper = new ProjetMapper();
    const projet = projetMapper.toBO(projetDTO);
    const savedProjet = await this.projetRepository.save(projet);
    return projetMapper.toDTO(savedProjet);
  }

  async findAll(): Promise<ProjetDTO[]> {
    const projets = await this.projetRepository.find({
      relations: ['team', 'team.owner', 'tasks']
    });
    const projetMapper = new ProjetMapper();
    return projets.map(projet => projetMapper.toDTO(projet));
  }

  async findById(id: number): Promise<ProjetDTO> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'tasks']
    });
    if (!projet) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    const projetMapper = new ProjetMapper();
    return projetMapper.toDTO(projet);
  }

  async findProjectsByMemberId(memberId: number): Promise<ProjetDTO[]> {
    // Find all teams where the user is a member
    const teams = await this.teamRepository.find({
      where: [
        { owner: { id: memberId } },
        { members: { id: memberId } }
      ],
      relations: ['projets', 'projets.tasks', 'owner', 'members']
    });

    // Get all projects from these teams
    const projects = teams.flatMap(team => team.projets);

    const projetMapper = new ProjetMapper();
    return projects.map(projet => projetMapper.toDTO(projet));
  }

  async getProjetsByTeamId(teamId: number): Promise<ProjetDTO[]> {
    const projets = await this.projetRepository.find({
      where: { team: { id: teamId } },
      relations: ['team', 'team.owner', 'tasks']
    });
    const projetMapper = new ProjetMapper();
    return projets.map(projet => projetMapper.toDTO(projet));
  }

  async update(id: number, projetDTO: ProjetDTO): Promise<ProjetDTO> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'tasks']
    });
    if (!projet) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    const projetMapper = new ProjetMapper();
    const updatedProjet = projetMapper.toBO(projetDTO);
    updatedProjet.id = id;
    
    const savedProjet = await this.projetRepository.save(updatedProjet);
    return projetMapper.toDTO(savedProjet);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projetRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
