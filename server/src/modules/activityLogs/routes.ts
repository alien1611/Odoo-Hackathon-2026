import { Router } from "express";
import { ActivityLogController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new ActivityLogController();

router.use(authenticate);

// Business Rule: Only Admins should view/manage the global system audit trail
router.get("/", requireRole(["ADMIN"]), controller.getLogs);
router.get("/:id", requireRole(["ADMIN"]), controller.getById);
router.post("/", requireRole(["ADMIN"]), controller.create);
router.patch("/:id", requireRole(["ADMIN"]), controller.update);
router.delete("/:id", requireRole(["ADMIN"]), controller.delete);

export default router;