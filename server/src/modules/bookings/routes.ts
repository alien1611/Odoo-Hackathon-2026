import { Router } from 'express';
import { BookingController } from './controller';
import { BookingService } from './service';
import { BookingRepository } from './repository';
import { prisma } from '../../config/database';
import { validateRequest } from '../../middleware/validateRequest';
import { createBookingSchema, updateBookingSchema } from './validation';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Dependency Injection
const repository = new BookingRepository(prisma);
const service = new BookingService(repository);
const controller = new BookingController(service);

// Route Definitions
router.post(
  '/',
  authenticate,
  validateRequest(createBookingSchema),
  controller.createBooking
);

router.get(
  '/',
  authenticate,
  controller.getAllBookings
);

router.patch(
  '/:id',
  authenticate,
  validateRequest(updateBookingSchema),
  controller.updateBooking
);

router.delete(
  '/:id',
  authenticate,
  controller.deleteBooking
);

export const bookingRoutes = router;
export default bookingRoutes;
