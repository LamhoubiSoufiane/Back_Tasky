import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { ProjetDTO } from './projetDto/projetDTO';
import { Projet } from './projet/projet';

@Controller('projets')
export class ProjetsController {
    constructor(private readonly projetsService: ProjetsService) {}
    
    @Post('create')
    async create(@Body() projetDto: ProjetDTO): Promise<Projet> {
        return this.projetsService.create(projetDto);
    }

    @Get()
    async findAll(): Promise<Projet[]>{
        return this.projetsService.findAll();
    }

    @Post('find')
    async findOne(@Body('id') id: number): Promise<Projet> {
      return this.projetsService.findById(id);
    }

    @Post('update')
    async update(
      @Body('id') id: number,
      @Body() projetDto: ProjetDTO,
    ): Promise<Projet> {
      return this.projetsService.update(id, projetDto);
    }
/*
    @Patch('update')
    async update(
    @Body('id') id: number,
    @Body() projetDto: ProjetDTO,
    ): Promise<Projet> {
    return this.projetsService.update(id, projetDto);
    }
*/
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.projetsService.remove(id);
    }

}
