import { PrismaClient } from "@prisma/client";
import { DepartmentInput } from "./validation";

const prisma = new PrismaClient();

export class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            role: true,
          },
        },
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            role: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            role: true,
            status: true,
          },
          take: 50,
        },
        assets: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            status: true,
            purchaseCost: true,
            location: true,
          },
          take: 50,
        },
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [totalDepartments, activeDepartments, totalEmployees, totalAssets] = await Promise.all([
      prisma.department.count(),
      prisma.department.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { departmentId: { not: null } } }),
      prisma.asset.count(),
    ]);

    return {
      totalDepartments,
      activeDepartments,
      inactiveDepartments: totalDepartments - activeDepartments,
      totalEmployees,
      totalAssets,
    };
  }

  async create(data: DepartmentInput) {
    return prisma.department.create({
      data: {
        name: data.name,
        description: data.description || null,
        headId: data.headId ? data.headId : null,
        status: data.status || "ACTIVE",
      },
      include: {
        head: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { employees: true, assets: true },
        },
      },
    });
  }

  async update(id: string, data: Partial<DepartmentInput>) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.headId !== undefined) updateData.headId = data.headId ? data.headId : null;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.department.update({
      where: { id },
      data: updateData,
      include: {
        head: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { employees: true, assets: true },
        },
      },
    });
  }

  async delete(id: string) {
    const count = await prisma.department.findUnique({
      where: { id },
      select: {
        _count: {
          select: { employees: true, assets: true },
        },
      },
    });

    if (count?._count.employees && count._count.employees > 0) {
      throw new Error(`Cannot delete department: ${count._count.employees} employees are still assigned.`);
    }

    if (count?._count.assets && count._count.assets > 0) {
      throw new Error(`Cannot delete department: ${count._count.assets} assets are still assigned.`);
    }

    return prisma.department.delete({ where: { id } });
  }
}