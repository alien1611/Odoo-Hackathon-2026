"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DepartmentRepository {
    async findAll() {
        return prisma.department.findMany({
            include: { head: { select: { name: true, email: true } } },
        });
    }
    async findById(id) {
        return prisma.department.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.department.create({ data });
    }
    async update(id, data) {
        return prisma.department.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.department.delete({ where: { id } });
    }
}
exports.DepartmentRepository = DepartmentRepository;
//# sourceMappingURL=repository.js.map