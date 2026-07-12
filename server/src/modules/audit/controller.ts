import { Request, Response, NextFunction } from 'express';
import { AuditService } from './service';

export class AuditController {
  constructor(private auditService: AuditService) {}

  createCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { name, scope, startDate, endDate } = req.body;

      const result = await this.auditService.createCycle({
        name,
        scope,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Audit cycle successfully created.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCycles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as any,
      };

      const result = await this.auditService.getCycles(filters);

      res.status(200).json({
        success: true,
        message: 'Audit cycles retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCycleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.auditService.getCycleById(id);

      res.status(200).json({
        success: true,
        message: 'Audit cycle details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, scope, startDate, endDate, status } = req.body;

      const result = await this.auditService.updateCycle(id, {
        name,
        scope,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      });

      res.status(200).json({
        success: true,
        message: 'Audit cycle updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id: cycleId } = req.params;
      const { assetId, verificationStatus, remarks } = req.body;

      const result = await this.auditService.verifyAsset(cycleId, user.id, {
        assetId,
        verificationStatus,
        remarks,
      });

      res.status(200).json({
        success: true,
        message: 'Asset successfully audited and record logged.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getDiscrepancyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.auditService.getDiscrepancyReport(id);

      res.status(200).json({
        success: true,
        message: 'Audit discrepancy report generated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
