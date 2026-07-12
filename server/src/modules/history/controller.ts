import { Request, Response, NextFunction } from 'express';
import { AssetHistoryService } from './service';

export class AssetHistoryController {
  constructor(private historyService: AssetHistoryService) {}

  getHistoryByAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const data = await this.historyService.getHistoryByAsset(id, page, limit);

      res.status(200).json({
        success: true,
        message: 'Asset history log retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
