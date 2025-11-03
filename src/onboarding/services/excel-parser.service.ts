import { Injectable, BadRequestException } from '@nestjs/common';
import { PropertyRecordDto, PropertyDataDto } from '../dto/bulk-import.dto';

interface RawCSVRecord {
  CustomerCode?: string;
  HouseNo?: string;
  Street?: string;
  Name?: string;
  LGA?: string;
  Ward?: string;
  Zone?: string;
  PhoneNumber?: string;
  Property1?: string;
  Units1?: string | number;
  Rate1?: string | number;
  Amount1?: string | number;
  Property2?: string;
  Units2?: string | number;
  Rate2?: string | number;
  Amount2?: string | number;
  Property3?: string;
  Units3?: string | number;
  Rate3?: string | number;
  Amount3?: string | number;
  Property4?: string;
  Units4?: string | number;
  Rate4?: string | number;
  Amount4?: string | number;
  OutstandingBalance?: string | number;
  TotalAmount?: string | number;
}

@Injectable()
export class ExcelParserService {
  parseCSVFile(buffer: Buffer): PropertyRecordDto[] {
    try {
      const csvContent = buffer.toString('utf-8');

      // Parse the entire CSV content properly handling multiline quoted values
      const rows = this.parseEntireCSV(csvContent);

      if (rows.length === 0) {
        throw new Error('CSV file must have at least one data row');
      }

      console.log('Parsed structured rows:', rows.slice(0, 3));

      return this.transformStructuredData(rows);
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV file: ${error.message}`,
      );
    }
  }

  parseExcelFile(buffer: Buffer): PropertyRecordDto[] {
    // For now, treat Excel files as CSV (user should convert to CSV first)
    console.log('Excel buffer size:', buffer.length);
    throw new BadRequestException(
      'Excel files not supported yet. Please convert to CSV format.',
    );
  }

  private parseEntireCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    // Parse header and create column mapping
    const headerLine = this.parseCSVLine(lines[0]);
    const columnMap = this.createColumnMap(headerLine);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      // Create structured record using column mapping
      const record = this.createStructuredRecordFromHeaders(columnMap, values);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private createColumnMap(headers: string[]): Map<string, number> {
    const map = new Map<string, number>();
    headers.forEach((header, index) => {
      const normalized = header.trim().toLowerCase().replace(/\s+/g, '');
      map.set(normalized, index);
    });
    return map;
  }

  private createStructuredRecordFromHeaders(
    columnMap: Map<string, number>,
    values: string[],
  ): any | null {
    // Helper function to get value by column name (case-insensitive, space-insensitive)
    const getValue = (columnName: string): string => {
      const normalized = columnName.toLowerCase().replace(/\s+/g, '');
      const index = columnMap.get(normalized);
      return index !== undefined ? values[index] || '' : '';
    };

    // Get basic customer information
    const customerCode =
      getValue('customercode') || getValue('customer_code') || getValue('code');
    const name = getValue('name') || getValue('customername');
    const houseNo =
      getValue('houseno') || getValue('house_no') || getValue('housenumber');
    const street = getValue('street');
    const phoneNumber =
      getValue('phonenumber') || getValue('phone_number') || getValue('phone');
    const outstanding =
      getValue('outstandingbalance') ||
      getValue('outstanding_balance') ||
      getValue('outstanding');

    if (!customerCode || !name) return null;

    const record: any = {
      customerCode,
      houseNumber: houseNo,
      street,
      customerName: name,
      phoneNumber,
      outstanding: this.parseNumeric(outstanding),
      propertySubscriptions: [],
    };

    // Parse property types for Shinaola CSV format:
    // Headers: Property1,Unit,Rate,Property2,Unit,Rate,Property3,Unit,Rate,Property4,Unit,Rate
    // We need to find the indices of these columns and pair them correctly
    const propertyColumns = [];

    // Find all Property columns
    for (let i = 1; i <= 4; i++) {
      const propertyIdx = columnMap.get(`property${i}`);
      if (propertyIdx !== undefined && propertyIdx < values.length - 1) {
        // The next column after Property{i} should be Unit, and the one after that should be Rate
        const propertyType = values[propertyIdx];
        const units = values[propertyIdx + 1]; // Unit column is right after Property column
        const rate = values[propertyIdx + 2]; // Rate column is 2 positions after Property column

        if (propertyType && propertyType.trim() !== '') {
          propertyColumns.push({
            propertyName: propertyType.trim(),
            units: this.parseNumeric(units) || 0,
            rate: this.parseNumeric(rate) || 0,
            propertyIndex: i,
          });
        }
      }
    }

    record.propertySubscriptions = propertyColumns;

    return record;
  }

  private parseNumeric(value: string): number {
    if (!value || value.trim() === '') return 0;

    // Remove commas and convert to number
    const cleaned = value.replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private transformStructuredData(structuredData: any[]): PropertyRecordDto[] {
    const records: PropertyRecordDto[] = [];

    for (const row of structuredData) {
      try {
        // Skip empty or invalid rows
        if (!row.customerCode && !row.customerName) continue;

        // Map property subscriptions to PropertyDataDto format
        const properties: PropertyDataDto[] = [];
        if (row.propertySubscriptions && row.propertySubscriptions.length > 0) {
          for (const prop of row.propertySubscriptions) {
            properties.push({
              propertyType: prop.propertyName || '',
              units: prop.units || 0,
              rate: prop.rate || 0,
              totalAmount: (prop.units || 0) * (prop.rate || 0),
            });
          }
        }

        const record: PropertyRecordDto = {
          customerCode: row.customerCode || '',
          houseNo: row.houseNumber || '',
          street: row.street || '',
          name: row.customerName || '',
          lga: 'Default LGA', // Not provided in CSV, will be set during import
          ward: 'Default Ward', // Not provided in CSV, will be set during import
          zone: undefined,
          phoneNumber: row.phoneNumber || undefined,
          outstandingBalance: row.outstanding || 0,
          totalAmount: properties.reduce(
            (sum, prop) => sum + prop.totalAmount,
            0,
          ),
          properties: properties,
        };

        records.push(record);
      } catch (error) {
        console.warn(`Skipping invalid structured row: ${error.message}`, row);
      }
    }

    return records;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // Toggle quote state
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());
    return result;
  }

  private transformRawData(rawData: any[]): PropertyRecordDto[] {
    const records: PropertyRecordDto[] = [];

    for (const row of rawData) {
      try {
        // Skip empty rows
        if (!row.CustomerCode && !row[0]) continue;

        // Handle both object format (Excel) and array format (CSV)
        const record = this.mapRowToRecord(row);
        if (record) {
          records.push(record);
        }
      } catch (error) {
        console.warn(`Skipping invalid row: ${error.message}`, row);
      }
    }

    return records;
  }

  private mapRowToRecord(row: any): PropertyRecordDto | null {
    // Handle array format (CSV with header mapping)
    if (Array.isArray(row)) {
      return this.mapArrayRowToRecord(row);
    }

    // Handle object format (Excel)
    return this.mapObjectRowToRecord(row as RawCSVRecord);
  }

  private mapArrayRowToRecord(row: any[]): PropertyRecordDto | null {
    // Expected CSV column order based on actual ShinaOlaEnum4Amendment.csv structure:
    // S/N,CustomerCode,HouseNo,Street,Name,Outstanding,Property1,Unit,Rate,Property2,Unit,Rate,Property3,Unit,Rate,Property4,Unit,Rate,CUSTOMER TYPE
    const [
      ,
      customerCode,
      houseNo,
      street,
      name,
      outstanding,
      property1,
      units1,
      rate1,
      property2,
      units2,
      rate2,
      property3,
      units3,
      rate3,
      property4,
      units4,
      rate4,
      ,
    ] = row;

    if (!customerCode || !street) return null;

    const properties: PropertyDataDto[] = [];

    // Process up to 4 property types
    const propertyData = [
      { type: property1, units: units1, rate: rate1 },
      { type: property2, units: units2, rate: rate2 },
      { type: property3, units: units3, rate: rate3 },
      { type: property4, units: units4, rate: rate4 },
    ];

    for (const prop of propertyData) {
      if (prop.type && prop.units && prop.rate) {
        const units = this.parseNumber(prop.units);
        const rate = this.parseNumber(prop.rate);
        properties.push({
          propertyType: String(prop.type).trim(),
          units: units,
          rate: rate,
          totalAmount: units * rate, // Calculate amount from units * rate
        });
      }
    }

    // Extract LGA and Ward from street name if possible
    // For now, we'll use default values since the CSV doesn't have separate LGA/Ward columns
    const streetName = String(street || '').trim();

    return {
      customerCode: String(customerCode).trim(),
      houseNo: String(houseNo || '').trim(),
      street: streetName,
      name: String(name || '').trim(),
      lga: 'Lagos Island', // Default LGA - can be extracted from street if needed
      ward: 'Ward 1', // Default Ward - can be extracted from street if needed
      zone: undefined,
      phoneNumber: undefined,
      outstandingBalance: this.parseNumber(outstanding || 0),
      totalAmount: properties.reduce((sum, prop) => sum + prop.totalAmount, 0),
      properties,
    };
  }

  private mapObjectRowToRecord(row: RawCSVRecord): PropertyRecordDto | null {
    if (!row.CustomerCode) return null;

    const properties: PropertyDataDto[] = [];

    // Process up to 4 property types
    const propertyData = [
      {
        type: row.Property1,
        units: row.Units1,
        rate: row.Rate1,
        amount: row.Amount1,
      },
      {
        type: row.Property2,
        units: row.Units2,
        rate: row.Rate2,
        amount: row.Amount2,
      },
      {
        type: row.Property3,
        units: row.Units3,
        rate: row.Rate3,
        amount: row.Amount3,
      },
      {
        type: row.Property4,
        units: row.Units4,
        rate: row.Rate4,
        amount: row.Amount4,
      },
    ];

    for (const prop of propertyData) {
      if (prop.type && prop.units && prop.rate && prop.amount) {
        properties.push({
          propertyType: String(prop.type).trim(),
          units: this.parseNumber(prop.units),
          rate: this.parseNumber(prop.rate),
          totalAmount: this.parseNumber(prop.amount),
        });
      }
    }

    return {
      customerCode: String(row.CustomerCode).trim(),
      houseNo: String(row.HouseNo || '').trim(),
      street: String(row.Street || '').trim(),
      name: String(row.Name || '').trim(),
      lga: String(row.LGA || '').trim(),
      ward: String(row.Ward || '').trim(),
      zone: row.Zone ? String(row.Zone).trim() : undefined,
      phoneNumber: row.PhoneNumber ? String(row.PhoneNumber).trim() : undefined,
      outstandingBalance: this.parseNumber(row.OutstandingBalance || 0),
      totalAmount: this.parseNumber(row.TotalAmount || 0),
      properties,
    };
  }

  private parseNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove commas and convert to number
      const cleaned = value.replace(/,/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  validateRecords(records: PropertyRecordDto[]): {
    valid: PropertyRecordDto[];
    invalid: any[];
  } {
    const valid: PropertyRecordDto[] = [];
    const invalid: any[] = [];

    for (const record of records) {
      if (this.isValidRecord(record)) {
        valid.push(record);
      } else {
        invalid.push(record);
      }
    }

    return { valid, invalid };
  }

  private isValidRecord(record: PropertyRecordDto): boolean {
    return !!(
      record.customerCode &&
      record.houseNo &&
      record.street &&
      record.name &&
      record.lga &&
      record.ward &&
      record.properties &&
      record.properties.length > 0
    );
  }
}
