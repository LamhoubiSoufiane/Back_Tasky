import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDto } from './dto/taskDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() taskDto: TaskDto, @Request() req): Promise<TaskDto> {
    return this.tasksService.createTask(taskDto, req.user.id);
  }

  @Put(':taskId/assign/:memberId')
  async assignTaskToMember(
    @Param('taskId') taskId: number,
    @Param('memberId') memberId: number,
    @Request() req
  ): Promise<TaskDto> {
    return this.tasksService.assignTaskToMember(taskId, memberId, req.user.id);
  }

  @Get('project/:projectId')
  async getTasksByProject(@Param('projectId') projectId: number, @Request() req): Promise<TaskDto[]> {
    return this.tasksService.getTasksByProject(projectId, req.user.id);
  }

  @Get(':taskId')
  async getTaskById(@Param('taskId') taskId: number, @Request() req): Promise<TaskDto> {
    return this.tasksService.getTaskById(taskId, req.user.id);
  }
}
