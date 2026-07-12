"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const repository_1 = require("./repository");
class NotificationService {
    repo = new repository_1.NotificationRepository();
    async getUserNotifications(userId) {
        return this.repo.findByUserId(userId);
    }
    async markNotificationRead(id, userId) {
        const result = await this.repo.markAsRead(id, userId);
        if (result.count === 0) {
            throw new Error("Notification not found or unauthorized");
        }
        return { success: true };
    }
    async deleteNotification(id, userId) {
        const result = await this.repo.delete(id, userId);
        if (result.count === 0) {
            throw new Error("Notification not found or unauthorized");
        }
        return { success: true };
    }
    async getAll(page, limit) {
        const skip = (page - 1) * limit;
        return this.repo.findAll(skip, limit);
    }
    async getById(id) {
        const notification = await this.repo.findById(id);
        if (!notification)
            throw new Error("Notification not found");
        return notification;
    }
    async createNotification(data) {
        return this.repo.create(data);
    }
    async updateNotification(id, data) {
        return this.repo.update(id, data);
    }
    async deleteSingleNotification(id) {
        return this.repo.deleteSingle(id);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=service.js.map