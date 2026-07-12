import { Router } from 'express';
import { AuditController } from './controller';
import { AuditService } from './service';
import { AuditRepository } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { prisma } from '../../config/database';
import { validateRequest } from '../../middleware/validateRequest';
import { createCycleSchema, updateCycleSchema, verifyAssetSchema } from './validation';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Repositories
const auditRepository = new AuditRepository(prisma);
const assetRepository = new AssetRepository(prisma);
const historyRepository = new AssetHistoryRepository(prisma);

// Service
const service = new AuditService(
  auditRepository,
  assetRepository,
  historyRepository
);

// Controller
const controller = new AuditController(service);

// Routes
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  validateRequest(createCycleSchema),
  controller.createCycle
);

router.get(
  '/',
  authenticate,
  controller.getAllCycles
);

router.get(
  '/:id',
  authenticate,
  controller.getCycleById
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  validateRequest(updateCycleSchema),
  controller.updateCycle
);

router.post(
  '/:id/verify',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  validateRequest(verifyAssetSchema),
  controller.verifyAsset
);

router.get(
  '/:id/report',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  controller.getDiscrepancyReport
);

export const auditRoutes = router;
export default auditRoutes;
