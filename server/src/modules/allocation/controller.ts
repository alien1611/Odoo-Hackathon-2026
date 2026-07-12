import { Request, Response, NextFunction } from 'express';
import { AssetAllocationService } from './service';

export class AssetAllocationController {
  constructor(private allocationService: AssetAllocationService) {}

  allocateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user; // Set by authentication middleware
      const { assetId, employeeId, expectedReturnDate, remarks } = req.body;

      const result = await this.allocationService.allocateAsset({
        assetId,
        employeeId,
        allocatedBy: user.id,
        expectedReturnDate: new Date(expectedReturnDate),
        remarks,
      });

      res.status(201).json({
        success: true,
        message: 'Asset successfully allocated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  returnAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user; // Set by authentication middleware
      const { assetId, condition, remarks } = req.body;

      const result = await this.allocationService.returnAsset({
        assetId,
        returnedBy: user.id,
        condition,
        remarks,
      });

      res.status(200).json({
        success: true,
        message: 'Asset successfully returned and set to AVAILABLE.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAllocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        employeeId: req.query.employeeId as string,
        assetId: req.query.assetId as string,
        status: req.query.status as any,
      };

      const result = await this.allocationService.getAllocations(filters);

      res.status(200).json({
        success: true,
        message: 'Asset allocations retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
