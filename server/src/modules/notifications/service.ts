import { NotificationRepository } from "./repository";

export class NotificationService {
  private repo = new NotificationRepository();

  async getUserNotifications(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async markNotificationRead(id: string, userId: string) {
    const result = await this.repo.markAsRead(id, userId);
    if (result.count === 0) {
      throw new Error("Notification not found or unauthorized");
    }
    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    const result = await this.repo.delete(id, userId);
    if (result.count === 0) {
      throw new Error("Notification not found or unauthorized");
    }
    return { success: true };
  }
}