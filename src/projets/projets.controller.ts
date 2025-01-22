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
  async create(@Body() projetDTO: ProjetDTO): Promise<ProjetDTO> {
    return this.projetsService.create(projetDTO);
  }

  @Get()
  async findAll(): Promise<ProjetDTO[]>{
    return this.projetsService.findAll();
  }

  @Get('member/:memberId')
  async findProjectsByMember(@Param('memberId') memberId: number): Promise<ProjetDTO[]> {
    return this.projetsService.findProjectsByMemberId(memberId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ProjetDTO> {
    return this.projetsService.findById(id);
  }

  @Get('team/:teamId')
  async findByTeamId(@Param('teamId') teamId: number): Promise<ProjetDTO[]>{
    return this.projetsService.getProjetsByTeamId(teamId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() projetDTO: ProjetDTO): Promise<ProjetDTO> {
    return this.projetsService.update(id, projetDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.projetsService.remove(id);
  }
}
