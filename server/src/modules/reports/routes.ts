import { Router } from 'express';
import { ReportsController } from './controller';
import { ReportsService } from './service';
import { ReportsRepository } from './repository';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Repositories
const reportsRepository = new ReportsRepository(prisma);

// Service
const service = new ReportsService(reportsRepository);

// Controller
const controller = new ReportsController(service);

// Routes
router.get(
  '/dashboard',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getDashboardData
);

router.get(
  '/assets',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getAssetReport
);

router.get(
  '/bookings',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getBookingReport
);

router.get(
  '/maintenance',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getMaintenanceReport
);

router.get(
  '/audits',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getAuditReport
);

export const reportsRoutes = router;
export default reportsRoutes;
