import { Router } from 'express';
import { AssetController } from './controller';
import { AssetService } from './service';
import { AssetRepository } from './repository';
import { prisma } from '../../config/database'; 
import { validateRequest } from '../../middleware/validateRequest';
import { createAssetSchema, updateAssetSchema } from './validation';

const router = Router();

// Dependency Injection Assembly
const repository = new AssetRepository(prisma);
const service = new AssetService(repository);
const controller = new AssetController(service);

// Route Definitions
router.post('/', validateRequest(createAssetSchema), controller.createAsset);
router.get('/', controller.getAllAssets);
router.get('/:id', controller.getAssetById);
router.patch('/:id', validateRequest(updateAssetSchema), controller.updateAsset);
router.delete('/:id', controller.deleteAsset);

export const assetRoutes = router;