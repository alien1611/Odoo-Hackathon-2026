import type { Request, Response, NextFunction } from "express";
import { DashboardService } from "./service";

export class DashboardController {
  private service = new DashboardService();

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const stats = await this.service.getDashboardStats(userId);

      res.status(200).json({
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
