import { UserRepository } from "./repository";
import { Role } from "@prisma/client";

export class UserService {
  private repo = new UserRepository();

  async getEmployeeDirectory(page: number, limit: number, search?: string) {
    // Performance: Proper pagination handling
    const skip = (page - 1) * limit;
    return this.repo.findAllEmployees(skip, limit, search);
  }

  async promoteUser(id: string, newRole: Role) {
    if (!Object.values(Role).includes(newRole)) {
      throw new Error("Invalid role specified");
    }
    return this.repo.updateRole(id, newRole);
  }
}