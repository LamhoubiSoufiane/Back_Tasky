import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TaskDto } from './dto/taskDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './bo/task';
import { Repository } from 'typeorm';
import { TaskMapper } from './Mapper/taskMapper.mapper';
import { User } from '../users/user/user';
import { LocationsService } from '../locations/locations.service';
import { Location } from '../locations/location/location';
import { Projet } from '../projets/projet/projet';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Projet)
        private projetRepository: Repository<Projet>,
        private locationService: LocationsService
    ) {}

    async createTask(taskDto: TaskDto, currentUserId: number): Promise<TaskDto> {
        // Find the project with its team, owner and members
        const projet = await this.projetRepository.findOne({
            where: { id: taskDto.projetId },
            relations: ['team', 'team.owner', 'team.members']
        });

        if (!projet) {
            throw new NotFoundException(`Project with ID ${taskDto.projetId} not found`);
        }

        // Check if the current user is either the team owner or a team member
        const isTeamOwner = projet.team.owner.id === currentUserId;
        const isTeamMember = projet.team.members.some(member => member.id === currentUserId);

        if (!isTeamOwner && !isTeamMember) {
            throw new UnauthorizedException('Only team owner or team members can create tasks');
        }

        const taskMapper = new TaskMapper();
        const task = taskMapper.toBO(taskDto);
        task.projet = projet;

        if (taskDto.location) {
            const savedLocation = await this.locationService.createLocation(taskDto.location);
            if (savedLocation) {
                task.location = savedLocation;
            }
        }

        const savedTask = await this.tasksRepository.save(task);
        return taskMapper.toDTO(savedTask);
    }

    async assignTaskToMember(taskId: number, memberId: number, currentUserId: number): Promise<TaskDto> {
        // Find task with project, team, and owner information
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['projet', 'projet.team', 'projet.team.owner', 'projet.team.members']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // Verify if current user is the team owner
        if (task.projet.team.owner.id !== currentUserId) {
            throw new UnauthorizedException('Only team owner can assign tasks');
        }

        // Find the member
        const member = await this.usersRepository.findOne({
            where: { id: memberId }
        });

        if (!member) {
            throw new NotFoundException(`User with ID ${memberId} not found`);
        }

        // Verify if the member belongs to the team
        const isMemberOfTeam = task.projet.team.members.some(m => m.id === memberId);
        if (!isMemberOfTeam) {
            throw new UnauthorizedException('Can only assign tasks to team members');
        }

        // Assign the task
        task.member = member;
        const updatedTask = await this.tasksRepository.save(task);
        
        return new TaskMapper().toDTO(updatedTask);
    }

    async getAllTasks(): Promise<Task[]> {
        return this.tasksRepository.find();
    }

    async getTaskById(taskId: number, currentUserId: number): Promise<TaskDto> {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['projet', 'projet.team', 'projet.team.owner', 'projet.team.members', 'member', 'location']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // Check if user is either the owner, assigned member, or team member
        const isOwner = task.projet.team.owner.id === currentUserId;
        const isAssignedMember = task.member?.id === currentUserId;
        const isTeamMember = task.projet.team.members.some(member => member.id === currentUserId);

        if (!isOwner && !isAssignedMember && !isTeamMember) {
            throw new UnauthorizedException('Access denied to this task');
        }

        return new TaskMapper().toDTO(task);
    }

    async getTasksByUserId(userId: number): Promise<Task[]> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found!');
        return this.tasksRepository.find({ where: { member: user } });
    }

    async getTasksByProject(projectId: number, currentUserId: number): Promise<TaskDto[]> {
        const projet = await this.projetRepository.findOne({
            where: { id: projectId },
            relations: ['team', 'team.owner', 'team.members']
        });

        if (!projet) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // Check if user is either the owner or a member of the team
        const isOwner = projet.team.owner.id === currentUserId;
        const isMember = projet.team.members.some(member => member.id === currentUserId);

        if (!isOwner && !isMember) {
            throw new UnauthorizedException('Access denied to project tasks');
        }

        const tasks = await this.tasksRepository.find({
            where: { projet: { id: projectId } },
            relations: ['member', 'location', 'projet']
        });

        return tasks.map(task => new TaskMapper().toDTO(task));
    }

    async getTasksByMember(memberId: number): Promise<TaskDto[]> {
        const tasks = await this.tasksRepository.find({
            where: { member: { id: memberId } },
            relations: ['projet', 'member', 'location']
        });

        return tasks.map(task => new TaskMapper().toDTO(task));
    }
}
