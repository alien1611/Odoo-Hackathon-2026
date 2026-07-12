"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const service_1 = require("./service");
class NotificationController {
    service = new service_1.NotificationService();
    getNotifications = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const data = await this.service.getUserNotifications(userId);
            res.status(200).json({
                success: true,
                message: "Notifications retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    markAsRead = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            await this.service.markNotificationRead(id, userId);
            res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteNotification = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            await this.service.deleteNotification(id, userId);
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await this.service.getAll(page, limit);
            res.status(200).json({
                success: true,
                message: "Notifications retrieved successfully",
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
            const data = await this.service.getById(id);
            res.status(200).json({
                success: true,
                message: "Notification retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = await this.service.createNotification(req.body);
            res.status(201).json({
                success: true,
                message: "Notification created successfully",
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
            const data = await this.service.updateNotification(id, req.body);
            res.status(200).json({
                success: true,
                message: "Notification updated successfully",
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
            await this.service.deleteSingleNotification(id);
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=controller.js.map