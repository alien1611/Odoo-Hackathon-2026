"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const controller = new controller_1.DepartmentController();
router.use(auth_middleware_1.authenticate); // All department routes require auth
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
// Business Rule: ONLY ADMIN CAN MODIFY DEPARTMENTS
router.post("/", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.create);
router.patch("/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.update);
router.delete("/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.delete);
exports.default = router;
//# sourceMappingURL=routes.js.map