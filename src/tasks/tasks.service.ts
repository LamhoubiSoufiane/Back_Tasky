import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { TaskDto } from './dto/taskDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './bo/task';
import { Repository } from 'typeorm';
import { TaskMapper } from './Mapper/taskMapper.mapper';
import { User } from '../users/user/user';
import { LocationsService } from '../locations/locations.service';
import { InvalidCredentials } from '../exception/InvalidCredentials';
import { Location } from '../locations/location/location';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private locationService: LocationsService,
  ) {}

  async createTask(taskDto: TaskDto): Promise<TaskDto> {
    const locationDto = taskDto.location;
    const taskMapper = new TaskMapper();
    let savedLocation: Location = null;
    if (locationDto) {
      savedLocation = await this.locationService.createLocation(locationDto);
      if (!savedLocation) {
        throw new InvalidCredentials(
          'Erreur creating location!!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const task = taskMapper.toBO(taskDto);
    if(savedLocation){
        task.location =  savedLocation;
    }
    const savedTask = await this.tasksRepository.save(task);
    if (savedTask) return taskMapper.toDTO(savedTask);
    return null;
  }

  async assignTaskToUser(taskId: number, userId: number): Promise<TaskDto> {
    const task = await this.tasksRepository.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException('Task not found!');
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User Not Found!');
    task.member = user;
    const savedTask = await this.tasksRepository.save(task);
    return new TaskMapper().toDTO(savedTask);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasksRepository.find();
  }
  async getTaskById(taskId: number): Promise<TaskDto> {
    // @ts-ignore
    const task = await this.tasksRepository.findOne(taskId);
    if (!task) throw new NotFoundException('Task not found!');
    return new TaskMapper().toDTO(task);
  }
  async getTasksByUserId(userId: number): Promise<Task[]> {
    // @ts-ignore
    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException('User not found!');
    return this.tasksRepository.find({ where: { member: user } });
  }
}
