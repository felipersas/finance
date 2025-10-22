import { Decimal } from '@prisma/client/runtime/library';

export interface ExtractItem {
  id: string;
  data: Date;
  valor: Decimal;
  descricao: string | null;
  remetenteDestinatario: string | null;
  tipo: 'Pessoal' | 'Empresa' | null;
}
