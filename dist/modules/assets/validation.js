"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetSchema = exports.createAssetSchema = void 0;
const zod_1 = require("zod");
exports.createAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        assetTag: zod_1.z.string({ required_error: 'Asset Tag is required' }).min(3).max(100),
        serialNumber: zod_1.z.string({ required_error: 'Serial Number is required' }).min(3).max(255),
        name: zod_1.z.string({ required_error: 'Asset Name is required' }).min(2).max(255),
        description: zod_1.z.string().optional(),
        categoryId: zod_1.z.string({ required_error: 'Category ID must be a valid UUID' }).uuid(),
        departmentId: zod_1.z.string({ required_error: 'Department ID must be a valid UUID' }).uuid(),
        purchaseDate: zod_1.z.string({ required_error: 'Purchase Date is required' }).transform((val) => new Date(val)),
        purchaseCost: zod_1.z.number({ required_error: 'Purchase Cost must be a positive number' }).positive(),
        vendor: zod_1.z.string({ required_error: 'Vendor designation is required' }).min(2).max(150),
        warrantyExpiry: zod_1.z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
        location: zod_1.z.string({ required_error: 'Physical location tracking string is required' }).min(2).max(255),
        condition: zod_1.z.string({ required_error: 'Condition assessment is required' }).min(2).max(50),
        image: zod_1.z.string().url().optional(),
    }).refine((data) => {
        if (data.warrantyExpiry && data.warrantyExpiry <= data.purchaseDate) {
            return false;
        }
        return true;
    }, {
        message: 'Warranty expiration date must be chronologically after the purchase date.',
        path: ['warrantyExpiry'],
    }),
});
exports.updateAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(255).optional(),
        description: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        departmentId: zod_1.z.string().uuid().optional(),
        purchaseDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
        purchaseCost: zod_1.z.number().positive().optional(),
        vendor: zod_1.z.string().min(2).max(150).optional(),
        warrantyExpiry: zod_1.z.string().transform((val) => new Date(val)).optional(),
        location: zod_1.z.string().min(2).max(255).optional(),
        condition: zod_1.z.string().min(2).max(50).optional(),
        image: zod_1.z.string().url().optional(),
    }),
});
//# sourceMappingURL=validation.js.map