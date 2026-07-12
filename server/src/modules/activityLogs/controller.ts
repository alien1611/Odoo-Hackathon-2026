import type { Request, Response, NextFunction } from "express";
import { ActivityLogService } from "./service";

export class ActivityLogController {
  private service = new ActivityLogService();

  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await this.service.getAuditTrail(page, limit);
      res.status(200).json({
        success: true,
        message: "Activity logs retrieved successfully",
        data,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.getLogById(id);
      res.status(200).json({
        success: true,
        message: "Activity log retrieved successfully",
        data,
      });
    } catch (error: any) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createLog(req.body);
      res.status(201).json({
        success: true,
        message: "Activity log created successfully",
        data,
      });
    } catch (error: any) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.updateLog(id, req.body);
      res.status(200).json({
        success: true,
        message: "Activity log updated successfully",
        data,
      });
    } catch (error: any) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteLog(id);
      res.status(200).json({
        success: true,
        message: "Activity log deleted successfully",
        data: {},
      });
    } catch (error: any) {
      next(error);
    }
  };
}