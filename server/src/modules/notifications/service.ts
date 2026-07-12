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

  async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.repo.findAll(skip, limit);
  }

  async getById(id: string) {
    const notification = await this.repo.findById(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  }

  async createNotification(data: any) {
    return this.repo.create(data);
  }

  async updateNotification(id: string, data: any) {
    return this.repo.update(id, data);
  }

  async deleteSingleNotification(id: string) {
    return this.repo.deleteSingle(id);
  }
}