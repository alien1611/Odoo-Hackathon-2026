"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthRepository {
    async findUserByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }
    async findUserById(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            return null;
        // Destructure to remove the password, return the rest safely
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async createUser(data) {
        return prisma.user.create({ data });
    }
    async findAll(skip, take) {
        return prisma.user.findMany({
            skip,
            take,
            select: { id: true, name: true, email: true, role: true, designation: true, departmentId: true, status: true, createdAt: true }
        });
    }
    async update(id, data) {
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
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=repository.js.map