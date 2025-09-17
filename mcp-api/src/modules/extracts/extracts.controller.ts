import { Controller, Get, Query } from '@nestjs/common';
import { ExtractsService } from './extracts.service';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('extracts')
export class ExtractsController {
  constructor(private readonly extractsService: ExtractsService) {}

  @Get()
  async findAll(
    @Query() params: PaginatedParamsDto,
    @CurrentUser() user: JwtUser,
  ) {
    const data = await this.extractsService.findAll(params, user.userId);
    console.log(data);

    return {
      data,
      message: 'Extrato carregado com sucesso',
    };
  }
}
