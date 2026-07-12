import { Router } from 'express';
import { MaintenanceController } from './controller';
import { MaintenanceService } from './service';
import { MaintenanceRepository } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { prisma } from '../../config/database';
import { validateRequest } from '../../middleware/validateRequest';
import { createMaintenanceSchema, updateMaintenanceSchema } from './validation';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Repositories
const maintenanceRepository = new MaintenanceRepository(prisma);
const assetRepository = new AssetRepository(prisma);
const historyRepository = new AssetHistoryRepository(prisma);

// Service
const service = new MaintenanceService(
  maintenanceRepository,
  assetRepository,
  historyRepository
);

// Controller
const controller = new MaintenanceController(service);

// Routes
router.post(
  '/',
  authenticate,
  validateRequest(createMaintenanceSchema),
  controller.createRequest
);

router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  controller.getAllRequests
);

router.get(
  '/:id',
  authenticate,
  controller.getRequestById
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  validateRequest(updateMaintenanceSchema),
  controller.updateRequest
);

export const maintenanceRoutes = router;
export default maintenanceRoutes;
