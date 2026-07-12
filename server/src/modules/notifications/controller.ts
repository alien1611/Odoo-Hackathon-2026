import type { Request, Response, NextFunction } from "express";
import { NotificationService } from "./service";

export class NotificationController {
  private service = new NotificationService();

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const data = await this.service.getUserNotifications(userId);

      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      await this.service.markNotificationRead(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      await this.service.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.service.getAll(page, limit);
      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.getById(id);
      res.status(200).json({
        success: true,
        message: "Notification retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createNotification(req.body);
      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.updateNotification(id, req.body);
      res.status(200).json({
        success: true,
        message: "Notification updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteSingleNotification(id);
      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };
}