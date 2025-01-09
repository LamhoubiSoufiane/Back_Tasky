import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterTachesDTO {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}