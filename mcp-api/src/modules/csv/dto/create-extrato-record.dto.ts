import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExtratoRecordDto {
  // @IsDate({ message: 'data deve ser uma data válida' })
  @IsNotEmpty()
  data: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value as string))
  valor: number;

  @IsString()
  @IsNotEmpty()
  identificador: string;

  @IsString()
  @IsNotEmpty()
  descricao: string; // This will contain the full description that needs parsing

  @IsOptional()
  @IsString()
  tipoOperacao?: string;

  @IsOptional()
  @IsString()
  remetenteDestinatario?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  instituicaoFinanceira?: string;

  @IsOptional()
  @IsString()
  codigoBanco?: string;

  @IsOptional()
  @IsString()
  agencia?: string;

  @IsOptional()
  @IsString()
  conta?: string;
}
