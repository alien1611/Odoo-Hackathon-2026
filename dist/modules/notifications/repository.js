"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationRepository {
    // Used internally by other services (like Auth/Departments) to create alerts
    async create(data) {
        return prisma.notification.create({ data });
    }
    async findByUserId(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async markAsRead(id, userId) {
        return prisma.notification.updateMany({
            where: { id, userId }, // Ensure users can only modify their own notifications
            data: { read: true },
        });
    }
    async delete(id, userId) {
        return prisma.notification.deleteMany({
            where: { id, userId },
        });
    }
    async findAll(skip, take) {
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" }
            }),
            prisma.notification.count()
        ]);
        return { notifications, total };
    }
    async findById(id) {
        return prisma.notification.findUnique({
            where: { id }
        });
    }
    async update(id, data) {
        return prisma.notification.update({
            where: { id },
            data
        });
    }
    async deleteSingle(id) {
        return prisma.notification.delete({
            where: { id }
        });
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=repository.js.map