"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const database_1 = require("../../config/database");
class CategoryController {
    getAll = async (_req, res, next) => {
        try {
            const data = await database_1.prisma.category.findMany({
                orderBy: { createdAt: "desc" }
            });
            res.status(200).json({ success: true, message: "Success", data });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await database_1.prisma.category.findUnique({ where: { id } });
            if (!data) {
                res.status(404).json({ success: false, message: "Category not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Success", data });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const body = req.body;
            const { name, description, customFields } = body;
            const data = await database_1.prisma.category.create({
                data: { name, description, customFields: customFields }
            });
            res.status(201).json({ success: true, message: "Created", data });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const body = req.body;
            const { name, description, customFields } = body;
            const data = await database_1.prisma.category.update({
                where: { id },
                data: { name, description, customFields: customFields }
            });
            res.status(200).json({ success: true, message: "Updated", data });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const { id } = req.params;
            await database_1.prisma.category.delete({ where: { id } });
            res.status(200).json({ success: true, message: "Deleted", data: {} });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=controller.js.map