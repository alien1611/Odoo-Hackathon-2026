import { Router } from "express";
import { CategoryController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new CategoryController();

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
// Business Rule: Only Admin creates/modifies Categories (Asset Managers will use them)
router.post("/", requireRole(["ADMIN"]), controller.create);
router.patch("/:id", requireRole(["ADMIN"]), controller.update);
router.delete("/:id", requireRole(["ADMIN"]), controller.delete);

export default router;