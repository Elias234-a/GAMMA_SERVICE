import apiClient, { handleApiError } from './api';
import { AlertType } from '../App';

export interface Notification {
  _id: string;
  user: string;
  type: AlertType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCreateData {
  type: AlertType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  /**
   * Get all notifications for current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<{ notifications: Notification[] }>('/notifications');
      return response.data.notifications;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    try {
      await apiClient.delete('/notifications');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a notification (admin only)
   */
  async createNotification(data: NotificationCreateData): Promise<Notification> {
    try {
      const response = await apiClient.post<Notification>('/notifications', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new NotificationService();
