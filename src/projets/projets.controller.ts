import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { Projet } from './projet/projet';
import { ProjetDTO } from './projetDto/projetDTO';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projets')
@UseGuards(JwtAuthGuard)
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Post()
  async create(@Request() req, @Body() projetDto: ProjetDTO): Promise<Projet> {
    return this.projetsService.create(projetDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req): Promise<Projet[] | { message: string }> {
    return this.projetsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Projet> {
    return this.projetsService.findById(+id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() projetDto: ProjetDTO,
  ): Promise<Projet> {
    return this.projetsService.update(+id, projetDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.projetsService.remove(+id, req.user.userId);
  }
}
