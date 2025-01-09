import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Body } from '@nestjs/common';
import { TaskDto } from './dto/taskDto';
import { Task } from './bo/task';
import { LocationsService } from '../locations/locations.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private taskService: TasksService,

  ) {}

  @Post()
  async createTask(@Body() taskDto: TaskDto){
    return this.taskService.createTask(taskDto);
  }

  @Put(':taskId/assign/:userId')
  async assignTaskToUser(@Param('taskId') taskId: number, @Param('userId') userId: number ){
    return this.taskService.assignTaskToUser(taskId,userId);
  }
  /*@Put(':taskIk/updateTask')
  async updateTask(@Body() taskDto: TaskDto)*/

  @Get()
  async getAllTasks(){
    return this.taskService.getAllTasks();
  }
  @Get('user/:userId')
  async getTasksByUserId(@Param('userId') userId: number): Promise<Task[]>{
    return this.taskService.getTasksByUserId(userId);
  }
  @Get('task/:taskId')
  async getTaskById(@Param('taskId') taskId: number): Promise<TaskDto>{
    return this.taskService.getTaskById(taskId);
  }
}
