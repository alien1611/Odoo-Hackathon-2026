import { Request, Response } from "express";
import { UserService } from "./service";

export class UserController {
  private service = new UserService();

  getDirectory = async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Error retrieving employees", error: error.message });
    }
  };

  promoteUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const updatedUser = await this.service.promoteUser(id, role);

      res.status(200).json({
        success: true,
        message: `User promoted to ${role} successfully`,
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Promotion failed", error: error.message });
    }
  };
}