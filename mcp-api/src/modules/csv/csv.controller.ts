import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvService } from './csv.service';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      const result = await this.csvService.processCsvFile(
        file.buffer,
        user.userId,
      );

      return {
        message: 'CSV processed successfully',
        result: {
          totalProcessed: result.processed,
          duplicatesSkipped: result.duplicates,
          errorsCount: result.errors.length,
          errors: result.errors.length > 0 ? result.errors : undefined,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Error processing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get('records')
  async getRecords(@Query('identificador') identificador?: string) {
    if (identificador) {
      return this.csvService.getRecordsByIdentificador(identificador);
    }
    return this.csvService.getAllRecords();
  }
}
