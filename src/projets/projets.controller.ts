import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, Request } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { ProjetDTO } from './projetDto/projetDTO';
import { Projet } from './projet/projet';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projets')
@UseGuards(JwtAuthGuard)
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Post()
  async create(@Request() req,@Body() projetDTO: ProjetDTO): Promise<ProjetDTO> {
    return this.projetsService.create(projetDTO, req.user.userId);
  }

  @Get()
  async findAll(@Request() req): Promise<ProjetDTO[]> {
    return this.projetsService.findAll(req.user.userId);
  }

  @Get('member/:memberId')
  async findProjectsByMemberId(
    @Param('memberId') memberId: string,
    @Request() req
  ): Promise<ProjetDTO[]> {
    return this.projetsService.findProjectsByMemberId(+memberId, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<ProjetDTO> {
    return this.projetsService.findById(+id, req.user.userId);
  }

  @Get('team/:teamId')
  async getProjetsByTeamId(
    @Param('teamId') teamId: string,
    @Request() req
  ): Promise<ProjetDTO[]> {
    return this.projetsService.getProjetsByTeamId(+teamId, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() projetDTO: ProjetDTO,
    @Request() req
  ): Promise<ProjetDTO> {
    return this.projetsService.update(+id, projetDTO, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.projetsService.remove(+id, req.user.userId);
  }
}
