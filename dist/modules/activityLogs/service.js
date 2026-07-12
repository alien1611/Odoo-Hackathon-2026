"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const repository_1 = require("./repository");
class ActivityLogService {
    repo = new repository_1.ActivityLogRepository();
    // Internal helper for logging events from other controllers/services
    async logAction(userId, action, moduleName, description) {
        return this.repo.create({ userId, action, module: moduleName, description });
    }
    async getAuditTrail(page, limit) {
        const skip = (page - 1) * limit;
        return this.repo.findAll(skip, limit);
    }
    async getLogById(id) {
        const log = await this.repo.findById(id);
        if (!log)
            throw new Error("Activity log not found");
        return log;
    }
    async createLog(data) {
        return this.repo.create(data);
    }
    async updateLog(id, data) {
        return this.repo.update(id, data);
    }
    async deleteLog(id) {
        return this.repo.delete(id);
    }
}
exports.ActivityLogService = ActivityLogService;
//# sourceMappingURL=service.js.map