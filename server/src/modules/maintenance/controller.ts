import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from './service';

export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { assetId, issueTitle, description, priority } = req.body;

      const result = await this.maintenanceService.createRequest({
        assetId,
        reportedBy: user.id,
        issueTitle,
        description,
        priority,
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance request submitted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as any,
        priority: req.query.priority as any,
        assetId: req.query.assetId as string,
        assignedTo: req.query.assignedTo as string,
      };

      const result = await this.maintenanceService.getRequests(filters);

      res.status(200).json({
        success: true,
        message: 'Maintenance requests retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.maintenanceService.getRequestById(id);

      res.status(200).json({
        success: true,
        message: 'Maintenance request details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { assignedTo, status, approvalStatus, priority } = req.body;

      const result = await this.maintenanceService.updateRequest(id, user.id, {
        assignedTo,
        status,
        approvalStatus,
        priority,
      });

      res.status(200).json({
        success: true,
        message: 'Maintenance request successfully updated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
