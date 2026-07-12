import { Router } from "express";
import { AuthController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);
router.patch("/profile", authenticate, authController.updateProfile);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

// User CRUD routes secured for ADMINs
router.get("/", authenticate, requireRole(["ADMIN"]), authController.getAll);
router.get("/:id", authenticate, requireRole(["ADMIN"]), authController.getById);
router.post("/", authenticate, requireRole(["ADMIN"]), authController.create);
router.patch("/:id", authenticate, requireRole(["ADMIN"]), authController.update);
router.delete("/:id", authenticate, requireRole(["ADMIN"]), authController.delete);

export default router;