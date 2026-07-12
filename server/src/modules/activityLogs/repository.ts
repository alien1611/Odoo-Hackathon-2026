import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ActivityLogRepository {
  // Used internally by other services to log actions
  async create(data: { userId: string; action: string; module: string; description: string }) {
    return prisma.activityLog.create({ data });
  }

  // Used by the Admin API to view the audit trail
  async findAll(skip: number, take: number) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.activityLog.count(),
    ]);

    return { logs, total };
  }
}