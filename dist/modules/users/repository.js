"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserRepository {
    async findAllEmployees(skip, take, search) {
        const where = search
            ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
            : {};
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: where,
                skip,
                take,
                select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true },
            }),
            prisma.user.count({ where: where })
        ]);
        return { users, total };
    }
    async updateRole(id, role) {
        return prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, role: true } // Return minimum required data
        });
    }
    async findAll(skip, take) {
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
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true, createdAt: true }
        });
    }
    async create(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password || "Password123!", 10);
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true }
        });
    }
    async update(id, data) {
        if (data.password) {
            data.password = await bcrypt_1.default.hash(data.password, 10);
        }
        return prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true }
        });
    }
    async delete(id) {
        return prisma.user.delete({
            where: { id }
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=repository.js.map