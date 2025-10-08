import { Notification } from '@/types/notification';

// Mock data
let notifications: Notification[] = [
  {
    id: '1',
    title: 'Vencimento do DAS',
    description: 'Seu DAS vence em 3 dias. Não esqueça de pagar.',
    type: 'fiscal',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Estoque baixo',
    description: 'Produto X está com estoque abaixo do mínimo.',
    type: 'estoque',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '3',
    title: 'Boleto a vencer',
    description: 'Boleto de fornecedor vence amanhã.',
    type: 'financeiro',
    date: new Date().toISOString(),
    read: false,
  },
];

export function getNotifications() {
  return notifications;
}

export function addReminder(reminder: Notification) {
  notifications = [reminder, ...notifications];
}

export function updateReminder(reminder: Notification) {
  notifications = notifications.map(n => n.id === reminder.id ? reminder : n);
}

export function deleteReminder(id: string) {
  notifications = notifications.filter(n => n.id !== id);
}

export function markAsRead(id: string) {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
}
