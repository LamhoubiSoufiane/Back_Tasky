import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team/team.entity';
import { TeamDTO } from './dto/team.dto';
import { User } from '../users/user/user';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(teamDto: TeamDTO, currentUserId: number): Promise<Team> {
    const team = new Team();
    team.nom = teamDto.nom;

    // Le créateur devient automatiquement le chef d'équipe
    const owner = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!owner) {
      throw new NotFoundException(`User with ID ${currentUserId} not found`);
    }
    team.owner = owner;

    // Ajouter le chef d'équipe comme premier membre
    const memberIds = new Set([currentUserId, ...(teamDto.memberIds || [])]);
    team.members = await this.userRepository.findByIds([...memberIds]);

    return this.teamRepository.save(team);
  }

  async addMember(
    teamId: number,
    memberId: number,
    currentUserId: number,
  ): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['owner', 'members'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Vérifier si l'utilisateur actuel est le chef d'équipe
    if (team.owner.id !== currentUserId) {
      throw new UnauthorizedException('Only team owner can add members');
    }

    const newMember = await this.userRepository.findOne({
      where: { id: memberId },
    });
    if (!newMember) {
      throw new NotFoundException(`User with ID ${memberId} not found`);
    }

    // Vérifier si l'utilisateur est déjà membre
    if (team.members.some((member) => member.id === memberId)) {
      return team; // L'utilisateur est déjà membre
    }

    team.members = [...team.members, newMember];
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['members', 'owner'],
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'owner'],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async update(
    id: number,
    teamDto: TeamDTO,
    currentUserId: number,
  ): Promise<Team> {
    const team = await this.findOne(id);

    // Vérifier si l'utilisateur actuel est le chef d'équipe
    if (team.owner.id !== currentUserId) {
      throw new UnauthorizedException('Only team owner can update the team');
    }

    team.nom = teamDto.nom;

    if (teamDto.memberIds && teamDto.memberIds.length > 0) {
      // S'assurer que le chef d'équipe reste membre
      const memberIds = new Set([currentUserId, ...teamDto.memberIds]);
      team.members = await this.userRepository.findByIds([...memberIds]);
    }

    return this.teamRepository.save(team);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const team = await this.findOne(id);

    // Vérifier si l'utilisateur actuel est le chef d'équipe
    if (team.owner.id !== currentUserId) {
      throw new UnauthorizedException('Only team owner can delete the team');
    }

    await this.teamRepository.remove(team);
  }

  async getTeamMembers(teamId: number): Promise<User[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Équipe avec l'ID ${teamId} non trouvée`);
    }

    return team.members;
  }

  async findTeamsByUserId(userId: number): Promise<Team[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    return this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('team.owner', 'owner')
      .where('members.id = :userId', { userId })
      .getMany();
  }

  async removeMember(
    teamId: number,
    memberId: number,
    currentUserId: number,
  ): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['owner', 'members'],
    });

    if (!team) {
      throw new NotFoundException(`Équipe avec l'ID ${teamId} non trouvée`);
    }

    // Vérifier si l'utilisateur actuel est le chef d'équipe
    if (team.owner.id !== currentUserId) {
      throw new UnauthorizedException(
        "Seul le chef d'équipe peut retirer des membres",
      );
    }

    // Vérifier si on essaie de retirer le chef d'équipe
    if (memberId === team.owner.id) {
      throw new BadRequestException(
        "Le chef d'équipe ne peut pas être retiré de l'équipe",
      );
    }

    // Vérifier si l'utilisateur est membre de l'équipe
    const memberIndex = team.members.findIndex(
      (member) => member.id === memberId,
    );
    if (memberIndex === -1) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${memberId} n'est pas membre de cette équipe`,
      );
    }

    // Retirer le membre
    team.members = team.members.filter((member) => member.id !== memberId);
    return this.teamRepository.save(team);
  }
}
