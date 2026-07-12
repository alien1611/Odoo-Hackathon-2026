import { Router } from "express";
import { AuthController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);

export default router;