import { Router } from "express";
import { UserController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get("/directory", controller.getDirectory);
router.patch("/promote/:id", requireRole(["ADMIN"]), controller.promoteUser);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;