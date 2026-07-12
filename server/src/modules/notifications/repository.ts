import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationRepository {
  // Used internally by other services (like Auth/Departments) to create alerts
  async create(data: { userId: string; title: string; message: string; type: string }) {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId }, // Ensure users can only modify their own notifications
      data: { read: true },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}