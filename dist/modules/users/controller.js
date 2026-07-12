"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const service_1 = require("./service");
class UserController {
    service = new service_1.UserService();
    getDirectory = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const data = await this.service.getEmployeeDirectory(page, limit, search);
            res.status(200).json({
                success: true,
                message: "Employee directory retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    promoteUser = async (req, res, next) => {
        try {
            const id = req.params.id;
            const { role } = req.body;
            const updatedUser = await this.service.promoteUser(id, role);
            res.status(200).json({
                success: true,
                message: `User promoted to ${role} successfully`,
                data: updatedUser,
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
                message: "Users retrieved successfully",
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
                message: "User retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = await this.service.createUser(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully",
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
            const data = await this.service.updateUser(id, req.body);
            res.status(200).json({
                success: true,
                message: "User updated successfully",
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
            await this.service.deleteUser(id);
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserController = UserController;
//# sourceMappingURL=controller.js.map