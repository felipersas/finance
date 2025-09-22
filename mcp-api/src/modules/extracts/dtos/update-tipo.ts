import { ExtratoType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateTipoDto {
  @IsNotEmpty()
  @IsEnum(ExtratoType)
  tipo: ExtratoType;
}
