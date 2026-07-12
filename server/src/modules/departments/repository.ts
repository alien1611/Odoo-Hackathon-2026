import { PrismaClient } from "@prisma/client";
import { DepartmentInput } from "./validation";

const prisma = new PrismaClient();

export class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      include: { head: { select: { name: true, email: true } } },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({ where: { id } });
  }

  async create(data: DepartmentInput) {
    return prisma.department.create({ data });
  }

  async update(id: string, data: Partial<DepartmentInput>) {
    return prisma.department.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.department.delete({ where: { id } });
  }
}