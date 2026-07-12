import { Router } from "express";
import { NotificationController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const controller = new NotificationController();

// All notification routes require the user to be logged in
router.use(authenticate);

router.get("/user", controller.getNotifications);
router.patch("/read/:id", controller.markAsRead);
router.delete("/user/:id", controller.deleteNotification);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;