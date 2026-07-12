import { Request, Response } from "express";
import { ActivityLogService } from "./service";

export class ActivityLogController {
  private service = new ActivityLogService();

  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20; // Default to 20 logs per page

      const data = await this.service.getAuditTrail(page, limit);

      res.status(200).json({
        success: true,
        message: "Activity logs retrieved successfully",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve activity logs",
        error: error.message,
      });
    }
  };
}