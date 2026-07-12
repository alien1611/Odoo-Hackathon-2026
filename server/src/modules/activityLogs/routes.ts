import { Router } from "express";
import { ActivityLogController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new ActivityLogController();

router.use(authenticate);

// Business Rule: Only Admins should view the global system audit trail
router.get("/", requireRole(["ADMIN"]), controller.getLogs);

export default router;