"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const repository_1 = require("./repository");
const database_1 = require("../../config/database");
const validateRequest_1 = require("../../middleware/validateRequest");
const validation_1 = require("./validation");
const router = (0, express_1.Router)();
// Dependency Injection Assembly
const repository = new repository_1.AssetRepository(database_1.prisma);
const service = new service_1.AssetService(repository);
const controller = new controller_1.AssetController(service);
// Route Definitions
router.post('/', (0, validateRequest_1.validateRequest)(validation_1.createAssetSchema), controller.createAsset);
router.get('/', controller.getAllAssets);
router.get('/:id', controller.getAssetById);
router.patch('/:id', (0, validateRequest_1.validateRequest)(validation_1.updateAssetSchema), controller.updateAsset);
router.delete('/:id', controller.deleteAsset);
exports.assetRoutes = router;
//# sourceMappingURL=routes.js.map