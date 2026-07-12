import { Router } from "express";
import { DepartmentController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new DepartmentController();

router.use(authenticate); // All department routes require auth

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
// Business Rule: ONLY ADMIN CAN MODIFY DEPARTMENTS
router.post("/", requireRole(["ADMIN"]), controller.create);
router.patch("/:id", requireRole(["ADMIN"]), controller.update);
router.delete("/:id", requireRole(["ADMIN"]), controller.delete);

export default router;