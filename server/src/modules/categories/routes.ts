import { Router } from "express";
import { CategoryController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new CategoryController();

router.use(authenticate);

router.get("/", controller.getAll);
// Business Rule: Only Admin creates Categories (Asset Managers will use them)
router.post("/", requireRole(["ADMIN"]), controller.create);
router.patch("/:id", requireRole(["ADMIN"]), controller.update);

export default router;