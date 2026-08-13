import { DepartmentRepository } from "./repository";
import { DepartmentInput } from "./validation";
import { NotificationService } from "../notifications/service";
import { ActivityLogService } from "../activityLogs/service";

export class DepartmentService {
  private repo = new DepartmentRepository();
  private notificationService = new NotificationService();
  private activityLogService = new ActivityLogService();

  async getDepartments() {
    return this.repo.findAll();
  }

  async getDepartmentById(id: string) {
    const dept = await this.repo.findById(id);
    if (!dept) throw new Error("Department not found");
    return dept;
  }

  async getStats() {
    return this.repo.getStats();
  }

  async createDepartment(data: DepartmentInput, adminId?: string) {
    const dept = await this.repo.create(data);

    if (adminId) {
      await this.notificationService.createNotification({
        userId: adminId,
        title: "Department Created",
        message: `Department '${dept.name}' has been created successfully.`,
        type: "INFO",
      });

      await this.activityLogService.logAction(
        adminId,
        "CREATE_DEPARTMENT",
        "DEPARTMENT",
        `Created Department '${dept.name}'`
      );
    }

    return dept;
  }

  async updateDepartment(id: string, data: Partial<DepartmentInput>, adminId?: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Department not found");

    const dept = await this.repo.update(id, data);

    if (adminId) {
      await this.notificationService.createNotification({
        userId: adminId,
        title: "Department Updated",
        message: `Department '${dept.name}' has been updated.`,
        type: "INFO",
      });

      await this.activityLogService.logAction(
        adminId,
        "UPDATE_DEPARTMENT",
        "DEPARTMENT",
        `Updated Department '${dept.name}'`
      );
    }

    return dept;
  }

  async deleteDepartment(id: string, adminId?: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Department not found");

    const result = await this.repo.delete(id);

    if (adminId) {
      await this.notificationService.createNotification({
        userId: adminId,
        title: "Department Deleted",
        message: `Department '${existing.name}' was removed from the system.`,
        type: "ALERT",
      });

      await this.activityLogService.logAction(
        adminId,
        "DELETE_DEPARTMENT",
        "DEPARTMENT",
        `Deleted Department '${existing.name}'`
      );
    }

    return result;
  }
}