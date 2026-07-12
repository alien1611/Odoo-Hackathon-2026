import { Request, Response } from "express";
import { DepartmentService } from "./service";

export class DepartmentController {
  private service = new DepartmentService();

  getAll = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getDepartments();
      res.status(200).json({ success: true, message: "Success", data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Error", error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createDepartment(req.body);
      res.status(201).json({ success: true, message: "Created", data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Error", error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateDepartment(req.params.id as string, req.body);
      res.status(200).json({ success: true, message: "Updated", data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Error", error: error.message });
    }
  };
}