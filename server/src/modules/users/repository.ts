import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  async findAllEmployees(skip: number, take: number, search?: string) {
    const where = search 
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        skip,
        take,
        select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true },
      }),
      prisma.user.count({ where: where as any })
    ]);

    return { users, total };
  }

  async updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true } // Return minimum required data
    });
  }
}