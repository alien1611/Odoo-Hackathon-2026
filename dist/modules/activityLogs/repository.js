"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ActivityLogRepository {
    // Used internally by other services to log actions
    async create(data) {
        return prisma.activityLog.create({ data });
    }
    // Used by the Admin API to view the audit trail
    async findAll(skip, take) {
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
    async findById(id) {
        return prisma.activityLog.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } },
        });
    }
    async update(id, data) {
        return prisma.activityLog.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma.activityLog.delete({
            where: { id },
        });
    }
}
exports.ActivityLogRepository = ActivityLogRepository;
//# sourceMappingURL=repository.js.map