import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyDataDto {
  @IsString()
  propertyType: string;

  @IsNumber()
  units: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  totalAmount: number;
}

export class PropertyRecordDto {
  @IsString()
  customerCode: string;

  @IsString()
  houseNo: string;

  @IsString()
  street: string;

  @IsString()
  name: string;

  @IsString()
  lga: string;

  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsNumber()
  outstandingBalance: number;

  @IsNumber()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDataDto)
  properties: PropertyDataDto[];
}

export class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyRecordDto)
  records: PropertyRecordDto[];

  @IsString()
  wasteOperatorId: string;

  @IsOptional()
  @IsString()
  createdByEntityUserProfileId?: string;

  @IsOptional()
  @IsNumber()
  startRange?: number;

  @IsOptional()
  @IsNumber()
  endRange?: number;
}
