import * as service from '@/services/notifications';
import { Notification } from '@/types/notification';
import React, { createContext, useContext, useState } from 'react';

interface NotificationContextProps {
  notifications: Notification[];
  addReminder: (reminder: Notification) => void;
  updateReminder: (reminder: Notification) => void;
  deleteReminder: (id: string) => void;
  markAsRead: (id: string) => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(service.getNotifications());

  const refetch = () => setNotifications(service.getNotifications());

  const addReminder = (reminder: Notification) => {
    service.addReminder(reminder);
    refetch();
  };
  const updateReminder = (reminder: Notification) => {
    service.updateReminder(reminder);
    refetch();
  };
  const deleteReminder = (id: string) => {
    service.deleteReminder(id);
    refetch();
  };
  const markAsRead = (id: string) => {
    service.markAsRead(id);
    refetch();
  };

  return (
    <NotificationContext.Provider value={{ notifications, addReminder, updateReminder, deleteReminder, markAsRead, refetch }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
