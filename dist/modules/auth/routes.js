"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const authController = new controller_1.AuthController();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", auth_middleware_1.authenticate, authController.logout);
router.get("/profile", auth_middleware_1.authenticate, authController.getProfile);
// User CRUD routes secured for ADMINs
router.get("/", auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(["ADMIN"]), authController.getAll);
router.get("/:id", auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(["ADMIN"]), authController.getById);
router.post("/", auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(["ADMIN"]), authController.create);
router.patch("/:id", auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(["ADMIN"]), authController.update);
router.delete("/:id", auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(["ADMIN"]), authController.delete);
exports.default = router;
//# sourceMappingURL=routes.js.map