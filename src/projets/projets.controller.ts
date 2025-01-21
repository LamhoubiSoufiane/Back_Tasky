import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { ProjetDTO } from './projetDto/projetDTO';
import { Projet } from './projet/projet';

@Controller('projets')
export class ProjetsController {
    constructor(private readonly projetsService: ProjetsService) {}

    /*@Get()
    async findAll(): Promise<ProjetDTO[]>{
        return this.projetsService.findAll();
    }*/
    @Post()
    async create(@Body() projetDto: ProjetDTO): Promise<ProjetDTO> {
        return this.projetsService.create(projetDto);
    }

    /*@Put()
    async update(@Body() projetDto: ProjetDTO): Promise<ProjetDTO> {
        return this.projetsService.update(projetDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<string> {
        return this.projetsService.remove(id);
    }*/

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<ProjetDTO> {
      return this.projetsService.findById(id);
    }

    @Get('team/:teamId')
    async findByTeamId(@Param('teamId') teamId: number): Promise<ProjetDTO[]>{
        return this.projetsService.getProjetsByTeamId(teamId);
    }

    /*@Get('createur/:createurId')
    findByCreateur(@Param('createurId') createurId: number): Promise<ProjetDTO>{
        return this.projetsService.findByCreateur(createurId);
    }*/




}
