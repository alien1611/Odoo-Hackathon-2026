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
}