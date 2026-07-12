import type { Request, Response, NextFunction } from 'express';
import { AssetService } from './service';

export class AssetController {
  constructor(private assetService: AssetService) {}

  createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.assetService.onboardAsset(req.body);

      res.status(201).json({
        success: true,
        message: 'Asset successfully registered and QR generated.',
        data: result,
      });
    } catch (error) {
      next(error); // Passes the error to our global error handler
    }
  };

  getAllAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Map raw string queries to proper types for the service layer
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
        departmentId: req.query.departmentId as string,
        categoryId: req.query.categoryId as string,
        status: req.query.status as any,
        condition: req.query.condition as string,
        purchaseDateStart: req.query.purchaseDateStart as string,
        purchaseDateEnd: req.query.purchaseDateEnd as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
      };

      const data = await this.assetService.getPaginatedAssets(filters);

      res.status(200).json({
        success: true,
        message: 'Asset register retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAssetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.assetService.getAssetDetails(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Asset details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.assetService.updateAssetSpecs(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Asset specifications updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.assetService.safeDecommissionAsset(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Asset safely decommissioned (soft deleted).',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };

  // Standardized CRUD alias methods
  getAll = this.getAllAssets;
  getById = this.getAssetById;
  create = this.createAsset;
  update = this.updateAsset;
  delete = this.deleteAsset;
}