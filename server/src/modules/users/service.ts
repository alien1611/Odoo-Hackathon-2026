import { UserRepository } from "./repository";
import { Role } from "@prisma/client";
import { ActivityLogService } from "../activityLogs/service";
import { NotificationService } from "../notifications/service";

export class UserService {
  private repo = new UserRepository();
  private activityLogService = new ActivityLogService();
  private notificationService = new NotificationService();

  async getEmployeeDirectory(page: number, limit: number, search?: string) {
    // Performance: Proper pagination handling
    const skip = (page - 1) * limit;
    return this.repo.findAllEmployees(skip, limit, search);
  }

  async promoteUser(id: string, newRole: Role, adminId?: string) {
    if (!Object.values(Role).includes(newRole)) {
      throw new Error("Invalid role specified");
    }
    const updatedUser = await this.repo.updateRole(id, newRole);

    // Create a notification for the promoted employee
    await this.notificationService.createNotification({
      userId: id,
      title: "Role Change Alert",
      message: `Your role has been updated to ${newRole}.`,
      type: "SYSTEM",
    });

    // Log the activity
    if (adminId) {
      await this.activityLogService.logAction(
        adminId,
        "PROMOTE_EMPLOYEE",
        "USER",
        `Promoted employee ${updatedUser.name || id} to role ${newRole}`
      );
    }

    return updatedUser;
  }

  async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.repo.findAll(skip, limit);
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async createUser(data: any) {
    return this.repo.create(data);
  }

  async updateUser(id: string, data: any) {
    return this.repo.update(id, data);
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
  }
}