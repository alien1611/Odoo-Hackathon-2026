import { Router } from "express";
import { UserController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get("/directory", controller.getDirectory);
// Business Rule: Admin Promotes Employee
router.patch("/promote/:id", requireRole(["ADMIN"]), controller.promoteUser);

export default router;