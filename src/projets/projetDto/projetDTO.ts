import { Column, ManyToOne } from 'typeorm';
import { Team } from '../../teams/team/team.entity';

export class ProjetDTO {
    id: number;
    nom: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    idTeam: number;
}

