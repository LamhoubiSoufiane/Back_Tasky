import { Injectable } from '@nestjs/common';
import { LocationDto } from '../dto/locationDto';
import { Location } from '../location/location';

@Injectable()
export class LocationMapper {
  toBO(dto: LocationDto): Location {
    const bo = new Location();
    bo.longitude = dto.longitude;
    bo.latitude = dto.latitude; // Mapping manuel
    return bo;
  }

  toDTO(bo: Location): LocationDto {
    const dto = new LocationDto();
    dto.latitude = bo.latitude;
    dto.longitude = bo.longitude;
    return dto;
  }
}