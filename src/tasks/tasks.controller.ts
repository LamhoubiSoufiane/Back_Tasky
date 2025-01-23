import { Body, Controller, Get, Param, Post, Put, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDto } from './dto/taskDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksStatut } from './Enum/tasksStatut.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() taskDto: TaskDto, @Request() req): Promise<TaskDto> {
    return this.tasksService.createTask(taskDto, req.user.userId);
  }

  @Put(':taskId/assign/:memberId')
  async assignTaskToMember(
    @Param('taskId') taskId: number,
    @Param('memberId') memberId: number,
    @Request() req
  ): Promise<TaskDto> {
    return this.tasksService.assignTaskToMember(taskId, memberId, req.user.userId);
  }

  @Get('project/:projectId')
  async getTasksByProject(@Param('projectId') projectId: number, @Request() req): Promise<TaskDto[]> {
    return this.tasksService.getTasksByProject(projectId, req.user.userId);
  }

  @Get('my-tasks')
  async getMyTasks(@Request() req): Promise<TaskDto[]> {
    return this.tasksService.getTasksByMember(req.user.userId);
  }

  @Get(':taskId')
  async getTaskById(@Param('taskId') taskId: number, @Request() req): Promise<TaskDto> {
    return this.tasksService.getTaskById(taskId, req.user.userId);
  }

  @Get('my-tasks/a-faire')
  async getMyTasksToDo(@Request() req) {
    return this.tasksService.getMyTasksByStatus(req.user.id, TasksStatut.AFAIRE);
  }

  @Get('my-tasks/en-cours')
  async getMyTasksInProgress(@Request() req) {
    return this.tasksService.getMyTasksByStatus(req.user.id, TasksStatut.ENCOURS);
  }

  @Get('my-tasks/terminees')
  async getMyCompletedTasks(@Request() req) {
    return this.tasksService.getMyTasksByStatus(req.user.id, TasksStatut.TERMINEE);
  }

  @Get('my-tasks/project/:projectId')
  async getMyTasksByProject(@Request() req, @Param('projectId', ParseIntPipe) projectId: number) {
    return this.tasksService.getMyTasksByProject(req.user.id, projectId);
  }
}
