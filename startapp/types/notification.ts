export type NotificationType = 'financeiro' | 'estoque' | 'fiscal' | 'contrato' | 'lembrete';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  date: string; // ISO
  time?: string; // HH:mm
  read: boolean;
  isReminder?: boolean;
}
