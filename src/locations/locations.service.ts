import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './location/location';
import { Repository } from 'typeorm';
import { LocationDto } from './dto/locationDto';
import { LocationMapper } from './Mapper/locationmapper.mapper';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async createLocation(locationDto: LocationDto): Promise<Location>{
    const location = new LocationMapper().toBO(locationDto);
    const savedLocation = await this.locationRepository.save(location);
    if(savedLocation) return savedLocation;
    return null;
  }
}
