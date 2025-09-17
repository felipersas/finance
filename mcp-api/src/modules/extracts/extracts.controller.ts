import { Controller, Get, Query } from '@nestjs/common';
import { ExtractsService } from './extracts.service';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';

@Controller('extracts')
export class ExtractsController {
  constructor(private readonly extractsService: ExtractsService) {}

  @Get()
  async findAll(@Query() params: PaginatedParamsDto) {
    const data = await this.extractsService.findAll(params);
    console.log(data);

    return {
      data,
      message: 'Extrato carregado com sucesso',
    };
  }
}
