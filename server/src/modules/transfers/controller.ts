import { Request, Response, NextFunction } from 'express';
import { TransferRequestService } from './service';

export class TransferRequestController {
  constructor(private transferService: TransferRequestService) {}

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { assetId, toDepartment, reason } = req.body;

      const result = await this.transferService.createRequest({
        assetId,
        requestedBy: user.id,
        toDepartment,
        reason,
      });

      res.status(201).json({
        success: true,
        message: 'Asset transfer request submitted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  processRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { status } = req.body;

      const result = await this.transferService.processRequest(id, {
        status,
        approvedBy: user.id,
      });

      res.status(200).json({
        success: true,
        message: `Asset transfer request successfully ${status.toLowerCase()}.`,
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
        assetId: req.query.assetId as string,
        requestedBy: req.query.requestedBy as string,
      };

      const result = await this.transferService.getRequests(filters);

      res.status(200).json({
        success: true,
        message: 'Asset transfer requests retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
