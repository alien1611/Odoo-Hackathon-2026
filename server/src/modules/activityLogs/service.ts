import { ActivityLogRepository } from "./repository";

export class ActivityLogService {
  private repo = new ActivityLogRepository();

  // Internal helper for logging events from other controllers/services
  async logAction(userId: string, action: string, moduleName: string, description: string) {
    return this.repo.create({ userId, action, module: moduleName, description });
  }

  async getAuditTrail(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.repo.findAll(skip, limit);
  }

  async getLogById(id: string) {
    const log = await this.repo.findById(id);
    if (!log) throw new Error("Activity log not found");
    return log;
  }

  async createLog(data: { userId: string; action: string; module: string; description: string }) {
    return this.repo.create(data);
  }

  async updateLog(id: string, data: any) {
    return this.repo.update(id, data);
  }

  async deleteLog(id: string) {
    return this.repo.delete(id);
  }
}