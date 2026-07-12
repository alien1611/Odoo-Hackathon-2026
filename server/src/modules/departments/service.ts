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

  async createDepartment(data: DepartmentInput, adminId?: string) {
    // Business Logic: Prevent duplicate names (Prisma throws, but manual check is cleaner for custom errors)
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

  async updateDepartment(id: string, data: Partial<DepartmentInput>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Department not found");
    return this.repo.update(id, data);
  }

  async deleteDepartment(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Department not found");
    return this.repo.delete(id);
  }
}