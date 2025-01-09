import { Body, Controller, Post } from '@nestjs/common';
import { TaskDto } from '../tasks/dto/taskDto';
import { TasksService } from '../tasks/tasks.service';
import { LocationsService } from './locations.service';
import { LocationDto } from './dto/locationDto';

@Controller('locations')
export class LocationsController {
  constructor(
    private locationService: LocationsService,
  ) {}
  @Post()
  async createLocation(@Body() locationDto: LocationDto){
    return this.locationService.createLocation(locationDto);
  }
}
