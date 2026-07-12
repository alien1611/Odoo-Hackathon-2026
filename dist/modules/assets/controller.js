"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
class AssetController {
    assetService;
    constructor(assetService) {
        this.assetService = assetService;
    }
    createAsset = async (req, res, next) => {
        try {
            const result = await this.assetService.onboardAsset(req.body);
            res.status(201).json({
                success: true,
                message: 'Asset successfully registered and QR generated.',
                data: result,
            });
        }
        catch (error) {
            next(error); // Passes the error to our global error handler
        }
    };
    getAllAssets = async (req, res, next) => {
        try {
            // Map raw string queries to proper types for the service layer
            const filters = {
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                search: req.query.search,
                departmentId: req.query.departmentId,
                categoryId: req.query.categoryId,
                status: req.query.status,
                condition: req.query.condition,
                purchaseDateStart: req.query.purchaseDateStart,
                purchaseDateEnd: req.query.purchaseDateEnd,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const data = await this.assetService.getPaginatedAssets(filters);
            res.status(200).json({
                success: true,
                message: 'Asset register retrieved successfully.',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getAssetById = async (req, res, next) => {
        try {
            const result = await this.assetService.getAssetDetails(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Asset details retrieved successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateAsset = async (req, res, next) => {
        try {
            const result = await this.assetService.updateAssetSpecs(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Asset specifications updated successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteAsset = async (req, res, next) => {
        try {
            await this.assetService.safeDecommissionAsset(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Asset safely decommissioned (soft deleted).',
                data: {},
            });
        }
        catch (error) {
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
exports.AssetController = AssetController;
//# sourceMappingURL=controller.js.map