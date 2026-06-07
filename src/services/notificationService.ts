import { api } from './api';

export async function getMyNotifications() {
  const res = await api.get<any>('/notifications');
  return res;
}

export async function markAsRead(notificationId: string) {
  return api.put<any>(`/notifications/${notificationId}/read`);
}

export async function markAllRead() {
  return api.put<any>('/notifications/read-all');
}

export async function sendNotification(data: Record<string, unknown>) {
  return api.post<any>('/notifications/send', data);
}

export async function getNotificationSummary() {
  const res = await api.get<any>('/notifications/summary');
  return res.summary;
}