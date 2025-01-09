import { Body, Controller,  Post, Get, Param, Put, Delete,Patch, Query,ParseIntPipe, InternalServerErrorException   } from '@nestjs/common';
import { TachesService } from './taches.service';
import { TacheDTO } from './tacheDto/tacheDTO';
import { Tache } from './tache/tache';
import { FilterTachesDTO } from './tacheDto/FilterTachesDTO';
@Controller('taches')
export class TachesController {
    constructor(
        private readonly tacheService: TachesService
    ){}

    @Post('create')
    create(@Body() createTacheDto: TacheDTO) {
        return this.tacheService.create(createTacheDto);
    }
    
    @Get()
    findAll() {
        return this.tacheService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
      return this.tacheService.findOne(id);
    }
    
      
  @Put(':id')
  update(@Param('id') id: number, @Body() updateTacheDto: TacheDTO) {
    return this.tacheService.update(id, updateTacheDto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tacheService.remove(id);
  }


  @Patch(':tacheId/assign/:memberId')
  async assignTacheToUser(
    @Param('tacheId', ParseIntPipe) tacheId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return await this.tacheService.assignTacheToUser(tacheId, memberId);
  }


  @Post('filter')
  async filter(
    @Body() body: { status?: string, startDate?: string, endDate?: string },
  ) {
    try {
     
      // Conversion des dates au format Date
      const start = body.startDate ? new Date(body.startDate) : undefined;
      const end = body.endDate ? new Date(body.endDate) : undefined;
  
      console.log("Start Date converted:", start);
      console.log("End Date converted:", end);
  
      // Validation des dates
      if (start && isNaN(start.getTime())) {
        throw new Error("La date de début est invalide.");
      }
      if (end && isNaN(end.getTime())) {
        throw new Error("La date de fin est invalide.");
      }
  
      // Appel de la méthode du service pour filtrer les tâches
      const taches = await this.tacheService.filterTaches(body.status, start, end);
  
      // Retour des tâches filtrées
      return taches;
  
    } catch (error) {
      console.error('Erreur lors du filtrage des tâches:', error.message);
      throw new InternalServerErrorException('Une erreur est survenue lors du filtrage des tâches');
    }
  }
  

  
}
