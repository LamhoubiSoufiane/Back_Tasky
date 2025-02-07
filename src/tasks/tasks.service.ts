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
import { TasksStatut } from './Enum/tasksStatut.enum';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Projet)
        private projetRepository: Repository<Projet>,
        private locationService: LocationsService,
        private taskGateway: TasksGateway,
    ) {}

    async createTask(taskDto: TaskDto, currentUserId: number): Promise<TaskDto> {
        // Find the project with its team, owner and members with proper relations
        const projet = await this.projetRepository.findOne({
            where: { id: taskDto.projetId },
            relations: ['team', 'team.owner', 'team.members']
        });

        if (!projet) {
            throw new NotFoundException(`Project with ID ${taskDto.projetId} not found`);
        }

        // Ensure we have the team owner loaded
        if (!projet.team || !projet.team.owner) {
            throw new NotFoundException(`Team or team owner not found for project ${taskDto.projetId}`);
        }

        // Check if the current user is the team owner
        const isTeamOwner = projet.team.owner.id === currentUserId;

        if (!isTeamOwner) {
            throw new UnauthorizedException('Only team owner can create tasks');
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
        // Notifier via WebSocket
        this.taskGateway.notifyTaskCreated(savedTask.projet.id, savedTask);
        return taskMapper.toDTO(savedTask);
    }

    async assignTaskToMember(taskId: number, memberId: number, currentUserId: number): Promise<TaskDto> {
        // Find task with project and team information
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['projet', 'projet.team', 'projet.team.owner', 'member']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // Verify if current user is the team owner
        if (task.projet.team.owner.id !== currentUserId) {
            throw new UnauthorizedException('Only team owner can assign tasks');
        }

        // Find the member
        const member = await this.usersRepository
            .createQueryBuilder('user')
            .innerJoin('user.teams', 'team')
            .where('user.id = :userId', { userId: memberId })
            .andWhere('team.id = :teamId', { teamId: task.projet.team.id })
            .getOne();

        if (!member) {
            throw new UnauthorizedException('Can only assign tasks to team members');
        }

        // Assign the task
        task.member = member;
        const updatedTask = await this.tasksRepository.save(task);
        // Notifier via WebSocket
        this.taskGateway.notifyTaskAssigned(updatedTask.projet.id, updatedTask, null);
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

    async getTasksByUserId(userId: number): Promise<TaskDto[]> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found!');
        const tasks = await this.tasksRepository.find({
            where: { member: user } ,
            relations: ['location'],
        });
        return tasks.map(task => new TaskMapper().toDTO(task));
    }

    async getTasksByProject(projectId: number, currentUserId: number): Promise<TaskDto[]> {
        const projet = await this.projetRepository.findOne({
            where: { id: projectId },
            relations: ['team', 'team.owner', 'team.members']
        });

        if (!projet) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // Check if user is a member of the team
        const isMember = projet.team.members.some(member => member.id === currentUserId);
        if (!isMember) {
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

    async getMyTasksByStatus(userId: number, status: TasksStatut) {
        return await this.tasksRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.projet', 'projet')
          .leftJoinAndSelect('projet.team', 'team')
          .leftJoinAndSelect('team.members', 'members')
          .leftJoinAndSelect('task.member', 'member')
          .where('member.id = :userId', { userId })
          .andWhere('task.statut = :status', { status })
          .getMany();
    }

    async getMyTasksByProject(userId: number, projectId: number) {
        const project = await this.projetRepository.findOne({
            where: { id: projectId },
            relations: ['team', 'team.owner', 'team.members']
        });
        if (!project) {
          throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // Check if user is a member of the project's team
        const isMember = project.team.members.some(member => member.id === userId);
        if (!isMember) {
          throw new UnauthorizedException('You are not a member of this project\'s team');
        }

        return await this.tasksRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.projet', 'projet')
          .where('task.member.id = :userId', { userId })
          .andWhere('projet.id = :projectId', { projectId })
          .getMany();
    }

    async deleteTask(taskId: number, currentUserId: number): Promise<void> {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['projet', 'projet.team', 'projet.team.owner']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        if (!task.projet?.team?.owner) {
            throw new NotFoundException('Team owner information not found');
        }

        if (task.projet.team.owner.id !== currentUserId) {
            throw new UnauthorizedException('Only team owner can delete tasks');
        }

        await this.tasksRepository.remove(task);
        // Notifier via WebSocket
        this.taskGateway.notifyTaskDeleted(task.projet.id, taskId,currentUserId);
    }

    async updateTask(taskId: number, taskDto: TaskDto, currentUserId: number): Promise<TaskDto> {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['projet', 'projet.team', 'projet.team.owner']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        if (!task.projet?.team?.owner) {
            throw new NotFoundException('Team owner information not found');
        }

        if (task.projet.team.owner.id !== currentUserId) {
            throw new UnauthorizedException('Only team owner can update tasks');
        }

        const taskMapper = new TaskMapper();
        const updatedTask = taskMapper.toBO(taskDto);
        updatedTask.id = task.id;
        updatedTask.projet = task.projet;

        const savedTask = await this.tasksRepository.save(updatedTask);
        // Notifier via WebSocket
        this.taskGateway.notifyTaskUpdated(savedTask.projet.id, savedTask);
        return taskMapper.toDTO(savedTask);
    }

    async updateTaskStatus(taskId: number, status: TasksStatut, currentUserId: number): Promise<TaskDto> {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['member', 'projet']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        if (!task.member) {
            throw new UnauthorizedException('This task is not assigned to any member');
        }

        if (task.member.id !== currentUserId) {
            throw new UnauthorizedException('Only assigned member can update task status');
        }

        task.statut = status;
        const savedTask = await this.tasksRepository.save(task);
        
        const taskMapper = new TaskMapper();
        // Notifier via WebSocket
        this.taskGateway.notifyTaskStatusUpdated(savedTask.projet.id, savedTask);
        return taskMapper.toDTO(savedTask);
    }
}
