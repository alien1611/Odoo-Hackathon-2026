"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const service_1 = require("./service");
class DepartmentController {
    service = new service_1.DepartmentService();
    getAll = async (_req, res, next) => {
        try {
            const data = await this.service.getDepartments();
            res.status(200).json({ success: true, message: "Success", data });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const data = await this.service.getDepartmentById(req.params.id);
            res.status(200).json({ success: true, message: "Success", data });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = await this.service.createDepartment(req.body);
            res.status(201).json({ success: true, message: "Created", data });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const data = await this.service.updateDepartment(req.params.id, req.body);
            res.status(200).json({ success: true, message: "Updated", data });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            await this.service.deleteDepartment(req.params.id);
            res.status(200).json({ success: true, message: "Deleted", data: {} });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.DepartmentController = DepartmentController;
//# sourceMappingURL=controller.js.map