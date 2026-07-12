"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogController = void 0;
const service_1 = require("./service");
class ActivityLogController {
    service = new service_1.ActivityLogService();
    getLogs = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20; // Default to 20 logs per page
            const data = await this.service.getAuditTrail(page, limit);
            res.status(200).json({
                success: true,
                message: "Activity logs retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const data = await this.service.getAuditTrail(page, limit);
            res.status(200).json({
                success: true,
                message: "Activity logs retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = await this.service.getLogById(id);
            res.status(200).json({
                success: true,
                message: "Activity log retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = await this.service.createLog(req.body);
            res.status(201).json({
                success: true,
                message: "Activity log created successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = await this.service.updateLog(id, req.body);
            res.status(200).json({
                success: true,
                message: "Activity log updated successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            await this.service.deleteLog(id);
            res.status(200).json({
                success: true,
                message: "Activity log deleted successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ActivityLogController = ActivityLogController;
//# sourceMappingURL=controller.js.map