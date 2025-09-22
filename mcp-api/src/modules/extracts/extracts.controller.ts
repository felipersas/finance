import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ExtractsService } from './extracts.service';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateTipoDto } from './dtos/update-tipo';

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

  @Patch(':id/tipo')
  async updateTipo(
    @Param('id') id: string,
    @Body() updateTipoDto: UpdateTipoDto,
    @CurrentUser() user: JwtUser,
  ) {
    const data = await this.extractsService.updateTipo(
      id,
      updateTipoDto.tipo,
      user.userId,
    );
    console.log(data);

    return {
      data,
      message: 'Categoria atualizada com sucesso',
    };
  }
}
