import { DashboardRepository } from "./repository";

export class DashboardService {
  private repo = new DashboardRepository();

  async getDashboardStats(userId: string) {
    const [counts, usersByRole, employeesByDepartment, recentActivity, latestLogins] = await Promise.all([
      this.repo.getCounts(userId),
      this.repo.getUsersByRole(),
      this.repo.getEmployeesByDepartment(),
      this.repo.getRecentActivity(),
      this.repo.getLatestLogins(),
    ]);

    return {
      counts,
      usersByRole,
      employeesByDepartment,
      recentActivity,
      latestLogins,
    };
  }
}
