"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const controller = new controller_1.ActivityLogController();
router.use(auth_middleware_1.authenticate);
// Business Rule: Only Admins should view/manage the global system audit trail
router.get("/", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.getLogs);
router.get("/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.getById);
router.post("/", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.create);
router.patch("/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.update);
router.delete("/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.delete);
exports.default = router;
//# sourceMappingURL=routes.js.map