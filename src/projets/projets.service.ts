import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Projet } from './projet/projet';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjetDTO } from './projetDto/projetDTO';
import { User } from '../users/user/user';
import { Team } from '../teams/team/team.entity';
import { ProjetMapper } from './Mapper/projetMapper.mapper';

@Injectable()
export class ProjetsService {
    constructor(
        @InjectRepository(Projet) 
        private readonly projetRepository: Repository<Projet>,
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Team)
        private equipeRepository: Repository<Team>,
        private projetMapper: ProjetMapper,
    ){}

  async create(projetDto: ProjetDTO): Promise<ProjetDTO>{
      const projetBo = this.projetMapper.toBO(projetDto);
      // @ts-ignore
    const team = await this.equipeRepository.findOne(projetDto.idTeam);
      if (!team) throw new NotFoundException(`Team with id ${projetDto.idTeam} Not Found (create Project)`);
      //projetBo.team = team;
      const projetToSave = this.projetRepository.create({
      ...projetBo,
      team,
      });
     const savedProjet = await this.projetRepository.save(projetToSave);
      return this.projetMapper.toDTO(savedProjet);
    }
  async findById(id: number): Promise<ProjetDTO> {
    const projet = await this.projetRepository.findOne({
      where: { id },
      relations: ['team'],
    });
    if (!projet) {
      throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
    }
    return this.projetMapper.toDTO(projet);
  }

  async getProjetsByTeamId(teamId: number): Promise<ProjetDTO[]> {
    const projets = await this.projetRepository.find({
      where: { team: { id: teamId } },
      relations: ['team'],
    });
    return projets.map(pr => this.projetMapper.toDTO(pr));
  }
  /*async findAll(): Promise<ProjetDTO[]> {
    return this.projetRepository.find({ relations: ['createur', 'equipe'] });
  }

    async create(projetDto: ProjetDTO): Promise<Projet>{
        const projet = this.projetRepository.create(projetDto);
        return await this.projetRepository.save(projet);
    }

    async update(id: number, projetDto: ProjetDTO): Promise<Projet>{
        const projet = await this.projetRepository.preload({
            id,
            ...projetDto,
        });
        if(!projet){
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }
        return await this.projetRepository.save(projet);
    }

    async remove(id: number): Promise<void>{
        const result = await this.projetRepository.delete(id);

        if(result.affected === 0){
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }
    }

    async findAll(): Promise<Projet[]>{
        return await this.projetRepository.find();
    }

    async findById(id: number): Promise<Projet> {
        const projet = await this.projetRepository.findOneBy({ id });

        if(!projet) {
            throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
        }

        return projet;
    }*/
}
