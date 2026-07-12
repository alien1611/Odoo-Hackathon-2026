import { Router } from "express";
import { DashboardController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/", authenticate, controller.getStats);

export default router;
