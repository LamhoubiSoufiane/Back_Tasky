import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Projet } from './projet/projet';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjetDTO } from './projetDto/projetDTO';

@Injectable()
export class ProjetsService {
    constructor(
        @InjectRepository(Projet) 
        private readonly projetRepository: Repository<Projet>,
    ){}

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
    }
}
