import { Controller, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Body } from '@nestjs/common';
import { TaskDto } from './dto/taskDto';

@Controller('tasks')
export class TasksController {
  constructor(
    private taskService: TasksService
  ) {}

  @Post()
  async createTask(@Body() taskDto: TaskDto){
    return this.taskService.createTask(taskDto);
  }
}
