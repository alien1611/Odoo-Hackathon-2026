import { prisma } from "../../config/database";

export class DashboardRepository {
  async getCounts(userId: string) {
    const [employees, departments, categories, unreadNotifications] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.category.count(),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      employees,
      departments,
      categories,
      unreadNotifications,
    };
  }

  async getUsersByRole() {
    const rawRoles = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    });
    return rawRoles.map(r => ({
      role: r.role,
      count: r._count.id,
    }));
  }

  async getEmployeesByDepartment() {
    const depts = await prisma.department.findMany({
      select: {
        name: true,
        _count: {
          select: { employees: true },
        },
      },
    });
    return depts.map(d => ({
      department: d.name,
      count: d._count.employees,
    }));
  }

  async getRecentActivity() {
    return prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getLatestLogins() {
    return prisma.activityLog.findMany({
      where: {
        action: {
          contains: "login",
          mode: "insensitive",
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
