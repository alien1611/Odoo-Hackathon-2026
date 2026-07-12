import { Router } from "express";
import { NotificationController } from "./controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const controller = new NotificationController();

// All notification routes require the user to be logged in
router.use(authenticate);

router.get("/", controller.getNotifications);
router.patch("/read/:id", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);

export default router;