import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

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

  async findAll(skip: number, take: number) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true, createdAt: true },
      }),
      prisma.user.count()
    ]);
    return { users, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true, createdAt: true }
    });
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password || "Password123!", 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true }
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }
}