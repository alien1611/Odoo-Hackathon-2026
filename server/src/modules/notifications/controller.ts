import { Request, Response } from "express";
import { NotificationService } from "./service";

export class NotificationController {
  private service = new NotificationService();

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const data = await this.service.getUserNotifications(userId);

      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
        error: error.message,
      });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;
      
      await this.service.markNotificationRead(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: {},
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Failed to update notification",
        error: error.message,
      });
    }
  };

  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      await this.service.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        data: {},
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  };
}