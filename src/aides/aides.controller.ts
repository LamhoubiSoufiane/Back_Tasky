import { Controller, Post, Body, Get, Param, Put, UseGuards, Request } from '@nestjs/common';
import { AidesService } from './aides.service';
import { AideDTO } from './dto/aide.dto';
import { Aide } from './aide/aide.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('aides')
@UseGuards(JwtAuthGuard)
export class AidesController {
    constructor(private readonly aidesService: AidesService) {}

    @Post()
    async createAide(@Body() aideDto: AideDTO, @Request() req): Promise<Aide> {
        return this.aidesService.createAide(aideDto, req.user.userId);
    }

    @Put(':id/accepter')
    async accepterAide(@Param('id') id: number, @Request() req): Promise<Aide> {
        return this.aidesService.accepterAide(id, req.user.userId);
    }

    @Put(':id/terminer')
    async terminerAide(@Param('id') id: number, @Request() req): Promise<Aide> {
        return this.aidesService.terminerAide(id, req.user.userId);
    }

    @Get('task/:taskId')
    async getAidesByTask(@Param('taskId') taskId: number): Promise<Aide[]> {
        return this.aidesService.getAidesByTask(taskId);
    }

    @Get('mes-demandes')
    async getMesDemandes(@Request() req): Promise<Aide[]> {
        return this.aidesService.getAidesByDemandeur(req.user.userId);
    }

    @Get('mes-aides')
    async getMesAides(@Request() req): Promise<Aide[]> {
        return this.aidesService.getAidesByAidant(req.user.userId);
    }

    @Get('project/:projectId/en-attente')
    async getAidesEnAttente(@Param('projectId') projectId: number): Promise<Aide[]> {
        return this.aidesService.getAidesEnAttente(projectId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getAideById(@Param('id') id: number, @Request() req): Promise<Aide> {
        return this.aidesService.getAideById(id, req.user.userId);
    }
}
