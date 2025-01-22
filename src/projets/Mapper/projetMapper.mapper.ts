import { Injectable } from '@nestjs/common';
import { ProjetDTO } from '../projetDto/projetDTO';
import { Projet } from '../projet/projet';
import { ProjetStatus } from '../projet/ProjetStatus';
import { Team } from '../../teams/team/team.entity'; // Updated Team import statement

@Injectable()
export class ProjetMapper {
  toBO(dto: ProjetDTO): Projet {
    const bo = new Projet();
    if(dto.id!=null) bo.id = dto.id;
    bo.nom = dto.nom;
    bo.description = dto.description;
    bo.startDate = new Date(dto.startDate);
    bo.endDate = new Date(dto.endDate);
    bo.status = ProjetStatus[dto.status];
    bo.team = { id: dto.idTeam } as Team;  // Updated to use idTeam instead of teamId
    return bo;
  }

  toDTO(bo: Projet): ProjetDTO {
    const dto = new ProjetDTO();
    dto.id = bo.id;
    dto.nom = bo.nom;
    dto.description = bo.description;
    dto.startDate = bo.startDate.toISOString();
    dto.endDate = bo.endDate.toISOString();
    dto.status = bo.status;
    dto.idTeam = bo.team.id;
    return dto;
  }
}