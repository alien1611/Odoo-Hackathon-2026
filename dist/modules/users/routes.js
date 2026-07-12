"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const controller = new controller_1.UserController();
router.use(auth_middleware_1.authenticate);
router.get("/directory", controller.getDirectory);
router.patch("/promote/:id", (0, rbac_middleware_1.requireRole)(["ADMIN"]), controller.promoteUser);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);
exports.default = router;
//# sourceMappingURL=routes.js.map