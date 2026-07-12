import type { Request, Response, NextFunction } from "express";
import { UserService } from "./service";

export class UserController {
  private service = new UserService();

  getDirectory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search ? String(req.query.search) : undefined;

      const data = await this.service.getEmployeeDirectory(page, limit, search);

      res.status(200).json({
        success: true,
        message: "Employee directory retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  promoteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const adminId = (req as any).user?.id;
      const updatedUser = await this.service.promoteUser(id, role, adminId);

      res.status(200).json({
        success: true,
        message: `User promoted to ${role} successfully`,
        data: updatedUser,
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
        message: "Users retrieved successfully",
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
        message: "User retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createUser(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteUser(id);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };
}