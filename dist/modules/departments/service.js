"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const repository_1 = require("./repository");
class DepartmentService {
    repo = new repository_1.DepartmentRepository();
    async getDepartments() {
        return this.repo.findAll();
    }
    async getDepartmentById(id) {
        const dept = await this.repo.findById(id);
        if (!dept)
            throw new Error("Department not found");
        return dept;
    }
    async createDepartment(data) {
        // Business Logic: Prevent duplicate names (Prisma throws, but manual check is cleaner for custom errors)
        return this.repo.create(data);
    }
    async updateDepartment(id, data) {
        const existing = await this.repo.findById(id);
        if (!existing)
            throw new Error("Department not found");
        return this.repo.update(id, data);
    }
    async deleteDepartment(id) {
        const existing = await this.repo.findById(id);
        if (!existing)
            throw new Error("Department not found");
        return this.repo.delete(id);
    }
}
exports.DepartmentService = DepartmentService;
//# sourceMappingURL=service.js.map