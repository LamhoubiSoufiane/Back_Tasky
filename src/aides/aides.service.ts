import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aide } from './aide/aide.entity';
import { AideDTO } from './dto/aide.dto';
import { User } from '../users/user/user';
import { Task } from '../tasks/bo/task';

@Injectable()
export class AidesService {
    constructor(
        @InjectRepository(Aide)
        private aideRepository: Repository<Aide>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>
    ) {}

    async createAide(aideDto: AideDTO, currentUserId: number): Promise<Aide> {
        const userTask = await this.taskRepository.findOne({
            where: { 
                id: aideDto.taskId,
                member: { id: currentUserId } 
            }
        });
    
        if (!userTask) {
            throw new UnauthorizedException(
                'You can only request help for tasks assigned to you'
            );
        }
        const task = await this.taskRepository.findOne({
            where: { id: aideDto.taskId },
            relations: ['member', 'projet', 'projet.team', 'projet.team.members']
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${aideDto.taskId} not found`);
        }

        if (!task.member) {
            throw new BadRequestException(`Task with ID ${aideDto.taskId} is not assigned to any member yet`);
        }

        // Verify if current user is assigned to the task
        if (task.member.id !== currentUserId) {
            throw new UnauthorizedException(
                `You cannot request help for this task. Only the assigned member (ID: ${task.member.id}) can request help.`
            );
        }

        const aide = this.aideRepository.create({
            description: aideDto.description,
            task: task,
            demandeur: { id: currentUserId } as User,
            status: 'en_attente'
        });

        return this.aideRepository.save(aide);
    }

    async accepterAide(aideId: number, currentUserId: number): Promise<Aide> {
        const aide = await this.aideRepository.findOne({
            where: { id: aideId },
            relations: ['demandeur', 'aidant', 'task', 'task.projet', 'task.projet.team', 'task.projet.team.members']
        });

        if (!aide) {
            throw new NotFoundException(`Aide with ID ${aideId} not found`);
        }

        // Verify if current user is part of the project team
        const isTeamMember = aide.task.projet.team.members.some(member => member.id === currentUserId);
        if (!isTeamMember) {
            throw new UnauthorizedException('Only team members can accept help requests');
        }

        if (aide.demandeur.id === currentUserId) {
            throw new BadRequestException('Cannot accept your own help request');
        }

        if (aide.status !== 'en_attente') {
            throw new BadRequestException('This help request is no longer pending');
        }

        aide.aidant = { id: currentUserId } as User;
        aide.status = 'acceptée';
        return this.aideRepository.save(aide);
    }

    async terminerAide(aideId: number, currentUserId: number): Promise<Aide> {
        const aide = await this.aideRepository.findOne({
            where: { id: aideId },
            relations: ['demandeur', 'aidant']
        });

        if (!aide) {
            throw new NotFoundException(`Aide with ID ${aideId} not found`);
        }

        if (aide.demandeur.id !== currentUserId && aide.aidant?.id !== currentUserId) {
            throw new UnauthorizedException('Only the requester or helper can mark the help as completed');
        }

        aide.status = 'terminée';
        return this.aideRepository.save(aide);
    }

    async getAidesByTask(taskId: number): Promise<Aide[]> {
        return this.aideRepository.find({
            where: { task: { id: taskId } },
            relations: ['demandeur', 'aidant', 'task']
        });
    }

    async getAidesByDemandeur(demandeurId: number): Promise<Aide[]> {
        return this.aideRepository.find({
            where: { demandeur: { id: demandeurId } },
            relations: ['demandeur', 'aidant', 'task']
        });
    }

    async getAidesByAidant(aidantId: number): Promise<Aide[]> {
        return this.aideRepository.find({
            where: { aidant: { id: aidantId } },
            relations: ['demandeur', 'aidant', 'task']
        });
    }

    async getAidesEnAttente(projectId: number): Promise<Aide[]> {
        return this.aideRepository.find({
            where: {
                status: 'en_attente',
                task: { projet: { id: projectId } }
            },
            relations: ['demandeur', 'task', 'task.projet']
        });
    }

    async getAideById(aideId: number, currentUserId: number): Promise<Aide> {
        const aide = await this.aideRepository.findOne({
            where: { id: aideId },
            relations: ['demandeur', 'aidant', 'task', 'task.projet', 'task.projet.team', 'task.projet.team.members']
        });

        if (!aide) {
            throw new NotFoundException(`Aide with ID ${aideId} not found`);
        }

        // Check if the current user is a member of the team that owns the project
        const isTeamMember = aide.task.projet.team.members.some(member => member.id === currentUserId);
        if (!isTeamMember) {
            throw new UnauthorizedException('Access denied. You must be a team member to view this aide');
        }

        return aide;
    }
}
