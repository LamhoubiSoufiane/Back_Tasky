import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Headers,
  Logger,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from './team/team.entity';
import { TeamDTO } from './dto/team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user/user';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Request() req, @Body() teamDto: TeamDTO): Promise<Team> {
    return this.teamService.create(teamDto, req.user.userId);
  }

  @Post(':teamId/members/:userId')
  addMember(
    @Request() req,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ): Promise<Team> {
    return this.teamService.addMember(+teamId, +userId, req.user.userId);
  }

  @Get()
  findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Team> {
    return this.teamService.findOne(+id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() teamDto: TeamDTO,
  ): Promise<Team> {
    return this.teamService.update(+id, teamDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.teamService.remove(+id, req.user.userId);
  }

  @Get(':id/members')
  async getTeamMembers(@Param('id') id: string): Promise<User[]> {
    const teamId = parseInt(id);
    return this.teamService.getTeamMembers(teamId);
  }

  @Get('user/:userId')
  async findTeamsByUserId(@Param('userId') userId: string): Promise<Team[]> {
    return this.teamService.findTeamsByUserId(+userId);
  }

  @Delete(':teamId/members/:userId')
  async removeMember(
    @Request() req,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ): Promise<Team> {
    return this.teamService.removeMember(+teamId, +userId, req.user.userId);
  }
}
