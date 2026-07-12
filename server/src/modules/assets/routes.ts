import { Router } from 'express';
import { AssetController } from './controller';
import { AssetService } from './service';
import { AssetRepository } from './repository';
import { prisma } from '../../config/database'; 
import { validateRequest } from '../../middleware/validateRequest';
import { createAssetSchema, updateAssetSchema } from './validation';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

// Allocation Imports
import { AssetAllocationRepository } from '../allocation/repository';
import { AssetAllocationService } from '../allocation/service';
import { AssetAllocationController } from '../allocation/controller';
import { allocateAssetSchema, returnAssetSchema } from '../allocation/validation';

// History Imports
import { AssetHistoryRepository } from '../history/repository';
import { AssetHistoryService } from '../history/service';
import { AssetHistoryController } from '../history/controller';

// Transfer Imports
import { TransferRequestRepository } from '../transfers/repository';
import { TransferRequestService } from '../transfers/service';
import { TransferRequestController } from '../transfers/controller';
import { createTransferSchema, approveTransferSchema } from '../transfers/validation';

const router = Router();

// Repositories
const assetRepository = new AssetRepository(prisma);
const historyRepository = new AssetHistoryRepository(prisma);
const allocationRepository = new AssetAllocationRepository(prisma);
const transferRepository = new TransferRequestRepository(prisma);

// Services
const assetService = new AssetService(assetRepository);
const historyService = new AssetHistoryService(historyRepository);
const allocationService = new AssetAllocationService(
  allocationRepository,
  assetRepository,
  historyRepository
);
const transferService = new TransferRequestService(
  transferRepository,
  assetRepository,
  historyRepository
);

// Controllers
const assetController = new AssetController(assetService);
const allocationController = new AssetAllocationController(allocationService);
const historyController = new AssetHistoryController(historyService);
const transferController = new TransferRequestController(transferService);

// ----------------------------------------------------
// ALLOCATION ROUTES (Step 2 & 3)
// ----------------------------------------------------
router.post(
  '/allocate',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  validateRequest(allocateAssetSchema),
  allocationController.allocateAsset
);

router.patch(
  '/return',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  validateRequest(returnAssetSchema),
  allocationController.returnAsset
);

router.get(
  '/allocations',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  allocationController.getAllAllocations
);

// ----------------------------------------------------
// TRANSFER WORKFLOW ROUTES (Step 4)
// ----------------------------------------------------
router.post(
  '/transfer',
  authenticate,
  validateRequest(createTransferSchema),
  transferController.createRequest
);

router.patch(
  '/transfer/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  validateRequest(approveTransferSchema),
  transferController.processRequest
);

router.get(
  '/transfers',
  authenticate,
  transferController.getAllRequests
);

// ----------------------------------------------------
// HISTORY ROUTES (Step 6)
// ----------------------------------------------------
router.get(
  '/history/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']),
  historyController.getHistoryByAsset
);

// ----------------------------------------------------
// ASSET CRUD ROUTES (Step 1)
// ----------------------------------------------------
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  validateRequest(createAssetSchema),
  assetController.createAsset
);

router.get(
  '/',
  authenticate,
  assetController.getAllAssets
);

router.get(
  '/:id',
  authenticate,
  assetController.getAssetById
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  validateRequest(updateAssetSchema),
  assetController.updateAsset
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'ASSET_MANAGER']),
  assetController.deleteAsset
);

export const assetRoutes = router;