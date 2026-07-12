import { DepartmentRepository } from "./repository";
import { DepartmentInput } from "./validation";

export class DepartmentService {
  private repo = new DepartmentRepository();

  async getDepartments() {
    return this.repo.findAll();
  }

  async createDepartment(data: DepartmentInput) {
    // Business Logic: Prevent duplicate names (Prisma throws, but manual check is cleaner for custom errors)
    return this.repo.create(data);
  }

  async updateDepartment(id: string, data: Partial<DepartmentInput>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Department not found");
    return this.repo.update(id, data);
  }
}