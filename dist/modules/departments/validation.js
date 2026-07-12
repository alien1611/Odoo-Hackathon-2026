"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentSchema = void 0;
const zod_1 = require("zod");
exports.departmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Department name must be at least 2 characters"),
    description: zod_1.z.string().optional(),
    headId: zod_1.z.string().uuid("Invalid User ID").optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
//# sourceMappingURL=validation.js.map