"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repository_1 = require("./repository");
const client_1 = require("@prisma/client");
class UserService {
    repo = new repository_1.UserRepository();
    async getEmployeeDirectory(page, limit, search) {
        // Performance: Proper pagination handling
        const skip = (page - 1) * limit;
        return this.repo.findAllEmployees(skip, limit, search);
    }
    async promoteUser(id, newRole) {
        if (!Object.values(client_1.Role).includes(newRole)) {
            throw new Error("Invalid role specified");
        }
        return this.repo.updateRole(id, newRole);
    }
    async getAll(page, limit) {
        const skip = (page - 1) * limit;
        return this.repo.findAll(skip, limit);
    }
    async getById(id) {
        const user = await this.repo.findById(id);
        if (!user)
            throw new Error("User not found");
        return user;
    }
    async createUser(data) {
        return this.repo.create(data);
    }
    async updateUser(id, data) {
        return this.repo.update(id, data);
    }
    async deleteUser(id) {
        return this.repo.delete(id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=service.js.map