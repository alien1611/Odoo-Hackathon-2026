// routes.ts
import { Router } from "express";
import { DepartmentController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new DepartmentController();

router.use(authenticate); // All department routes require auth

router.get("/", controller.getAll);
// Business Rule: ONLY ADMIN CAN CREATE DEPARTMENTS
router.post("/", requireRole(["ADMIN"]), controller.create);
router.patch("/:id", requireRole(["ADMIN"]), controller.update);

export default router;