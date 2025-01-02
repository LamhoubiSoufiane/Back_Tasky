import { Injectable } from '@nestjs/common';
import { TaskDto } from './dto/taskDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './bo/task';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async createTask(taskDto: TaskDto): Promise<TaskDto>{
    const task = await
  }
}
