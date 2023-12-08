import { ProfileTypes } from '@/src/lib/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Max(50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Max(50)
  lastName: string;

  @IsOptional()
  @IsString()
  @Max(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  phoneCodeId: string;

  @IsNotEmpty()
  @IsEnum(ProfileTypes)
  profileType: ProfileTypes;
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  @Max(50)
  propertyName: string;

  @IsNotEmpty()
  @IsNumber()
  propertyUnit: number;

  @IsNotEmpty()
  @IsNumberString()
  streetId: string;

  @IsNotEmpty()
  @IsString()
  streetNumber: string;

  @IsNotEmpty()
  @IsNumberString()
  propertyTypeId: string;

  @IsOptional()
  @IsString()
  oldCode: string;

  @IsNotEmpty()
  @IsNumberString()
  propertySubscriberProfileId: string;

  @IsOptional()
  @IsBoolean()
  isOwner: boolean;
}
