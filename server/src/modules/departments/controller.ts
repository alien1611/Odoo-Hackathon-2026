import type { Request, Response, NextFunction } from "express";
import { DepartmentService } from "./service";

export class DepartmentController {
  private service = new DepartmentService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDepartments();
      res.status(200).json({ success: true, message: "Success", data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDepartmentById(req.params.id as string);
      res.status(200).json({ success: true, message: "Success", data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const data = await this.service.createDepartment(req.body, adminId);
      res.status(201).json({ success: true, message: "Created", data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateDepartment(req.params.id as string, req.body);
      res.status(200).json({ success: true, message: "Updated", data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteDepartment(req.params.id as string);
      res.status(200).json({ success: true, message: "Deleted", data: {} });
    } catch (error) {
      next(error);
    }
  };
}