import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { NotificationService } from "../notifications/service";
import { ActivityLogService } from "../activityLogs/service";

export class CategoryController {
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await prisma.category.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.status(200).json({ success: true, message: "Success", data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await prisma.category.findUnique({ where: { id } });
      if (!data) {
        res.status(404).json({ success: false, message: "Category not found" });
        return;
      }
      res.status(200).json({ success: true, message: "Success", data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { name: string; description?: string; customFields?: any };
      const { name, description, customFields } = body;
      const data = await prisma.category.create({
        data: { name, description, customFields: customFields as any }
      });

      const adminId = (req as any).user?.id;
      if (adminId) {
        const notificationService = new NotificationService();
        const activityLogService = new ActivityLogService();

        await notificationService.createNotification({
          userId: adminId,
          title: "Category Created",
          message: `Category '${name}' has been created successfully.`,
          type: "INFO",
        });

        await activityLogService.logAction(
          adminId,
          "CREATE_CATEGORY",
          "CATEGORY",
          `Created Category '${name}'`
        );
      }

      res.status(201).json({ success: true, message: "Created", data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body as { name?: string; description?: string; customFields?: any };
      const { name, description, customFields } = body;
      const data = await prisma.category.update({
        where: { id },
        data: { name, description, customFields: customFields as any }
      });
      res.status(200).json({ success: true, message: "Updated", data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.category.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Deleted", data: {} });
    } catch (error) {
      next(error);
    }
  };
}