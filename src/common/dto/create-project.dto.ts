import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  MaxLength,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActionType } from '../../database/entities/project-action.entity';

export class CreateActionDto {
  @IsInt()
  @Min(0)
  actionOrder: number;

  @IsEnum(ActionType)
  actionType: ActionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  selector?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  narratorText: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  voiceModel?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  actions: CreateActionDto[];
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSegmentDto)
  segments: CreateSegmentDto[];
}
