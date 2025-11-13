import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { WasteOperatorService } from './services/waste-operator.service';
import { DataImportService } from './services/data-import.service';
import { ExcelParserService } from './services/excel-parser.service';

import { BulkImportDto } from './dto/bulk-import.dto';
import { CreateWasteOperatorDto } from './dto/create-waste-operator.dto';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly wasteOperatorService: WasteOperatorService,
    private readonly dataImportService: DataImportService,
    private readonly excelParserService: ExcelParserService,
  ) {}

  @Post('waste-operators')
  async createWasteOperator(@Body() createData: CreateWasteOperatorDto) {
    const result = await this.wasteOperatorService.create(createData);
    return {
      message: 'Waste operator registered successfully',
      data: result,
    };
  }

  @Get('waste-operators')
  @UseGuards(IsAuthenticated)
  async getAllWasteOperators() {
    const operators = await this.wasteOperatorService.findAll();
    return {
      message: 'Waste operators retrieved successfully',
      data: operators,
    };
  }

  @Get('check-operator/:email')
  async checkExistingOperator(@Param('email') email: string) {
    try {
      const operator = await this.wasteOperatorService.findByEmail(
        decodeURIComponent(email),
      );
      return operator || null;
    } catch (error) {
      return null;
    }
  }

  @Get('waste-operators/:id')
  @UseGuards(IsAuthenticated)
  async getWasteOperator(@Param('id') id: string) {
    const operator = await this.wasteOperatorService.findOne(id);
    return {
      message: 'Waste operator retrieved successfully',
      data: operator,
    };
  }

  @Patch('waste-operators/:id')
  @UseGuards(IsAuthenticated)
  async updateWasteOperator(
    @Param('id') id: string,
    @Body() updateData: { name?: string },
  ) {
    const operator = await this.wasteOperatorService.update(id, updateData);
    return {
      message: 'Waste operator updated successfully',
      data: operator,
    };
  }

  @Patch('waste-operators/:id/deactivate')
  @UseGuards(IsAuthenticated)
  async deactivateWasteOperator(@Param('id') id: string) {
    // For now, just return success - EntityProfile doesn't have active/inactive state
    const operator = await this.wasteOperatorService.findOne(id);
    return {
      message: 'Waste operator deactivated successfully',
      data: operator,
    };
  }

  @Patch('waste-operators/:id/activate')
  @UseGuards(IsAuthenticated)
  async activateWasteOperator(@Param('id') id: string) {
    // For now, just return success - EntityProfile doesn't have active/inactive state
    const operator = await this.wasteOperatorService.findOne(id);
    return {
      message: 'Waste operator activated successfully',
      data: operator,
    };
  }

  /**
   * Upload property data from CSV/Excel file
   *
   * Optional body parameters:
   * - startRange: Starting record number (1-based index) to process
   * - endRange: Ending record number (inclusive) to process. If not specified, processes to the end
   *
   * Examples:
   * - startRange: 1, endRange: 100 -> processes records 1-100
   * - startRange: 101, endRange: 200 -> processes records 101-200
   * - startRange: 201, endRange: undefined -> processes records 201 to end
   */
  @Post('upload-data/:wasteOperatorId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadPropertyData(
    @Param('wasteOperatorId') wasteOperatorId: string,
    @UploadedFile() file: any,
    @Req() req: any,
    @Body() body?: { startRange?: number; endRange?: number },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only Excel and CSV files are allowed.',
      );
    }

    try {
      // Parse the file
      let records;
      if (file.mimetype === 'text/csv') {
        records = this.excelParserService.parseCSVFile(file.buffer);
      } else {
        records = this.excelParserService.parseExcelFile();
      }

      // Validate records
      const { valid, invalid } =
        this.excelParserService.validateRecords(records);

      if (valid.length === 0) {
        throw new BadRequestException('No valid records found in the file');
      }

      // Import data
      const bulkImportDto: BulkImportDto = {
        records: valid,
        wasteOperatorId,
        createdByEntityUserProfileId: req.user?.entityUserProfileId,
        startRange: body?.startRange,
        endRange: body?.endRange,
      };

      const result = await this.dataImportService.importBulkData(bulkImportDto);

      return {
        message: 'Data import completed',
        data: {
          ...result,
          invalidRecords: invalid.length,
          invalidRecordsSample: invalid.slice(0, 5), // Show first 5 invalid records as sample
        },
      };
    } catch (error) {
      console.error('Data import error:', error);
      throw new BadRequestException(
        `Data import failed: ${error.message || error}`,
      );
    }
  }

  @Get('import-summary/:wasteOperatorId')
  async getImportSummary(@Param('wasteOperatorId') wasteOperatorId: string) {
    const summary = await this.dataImportService.getImportSummary(
      wasteOperatorId,
    );
    return {
      message: 'Import summary retrieved successfully',
      data: summary,
    };
  }

  /**
   * Download failed records as CSV
   * Accepts failed records in request body and returns CSV file
   */
  @Post('download-failed-records')
  @Header('Content-Type', 'text/csv')
  async downloadFailedRecords(
    @Body() body: { failedRecords: any[] },
    @Res() res: Response,
  ) {
    if (!body.failedRecords || body.failedRecords.length === 0) {
      throw new BadRequestException('No failed records provided');
    }

    const csvContent = this.dataImportService.generateFailedRecordsCSV(
      body.failedRecords,
    );

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `failed-records-${timestamp}.csv`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
  }

  @Delete('imported-data/:wasteOperatorId')
  async deleteImportedData(@Param('wasteOperatorId') wasteOperatorId: string) {
    await this.dataImportService.deleteImportedData(wasteOperatorId);
    return {
      message: 'Imported data deleted successfully',
    };
  }

  @Get('stats')
  @UseGuards(IsAuthenticated)
  async getStats() {
    const stats = await this.wasteOperatorService.getStats();
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }
}
