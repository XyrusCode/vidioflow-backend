import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActionType } from '../enums/action-type.enum';

export class CreateAutomationStepDto {
  @IsInt()
  @Min(1)
  stepOrder: number;

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

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  textContent: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  voiceModel?: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => CreateScriptDto)
  script: CreateScriptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAutomationStepDto)
  steps: CreateAutomationStepDto[];
}
