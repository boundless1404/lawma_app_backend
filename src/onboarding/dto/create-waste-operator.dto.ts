import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateWasteOperatorDto {
  @IsString()
  companyName: string;

  @IsString()
  contactPersonName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in Nigerian format (+234xxxxxxxxxx)',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  areaOfOperation?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;
}
