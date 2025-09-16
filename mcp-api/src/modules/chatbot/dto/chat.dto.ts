import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty({ message: 'A mensagem não pode ser vazia' })
  query: string;
}
