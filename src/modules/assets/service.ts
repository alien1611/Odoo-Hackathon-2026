import { AssetRepository } from './repository';
import { CreateAssetInput, UpdateAssetInput, AssetQueryFilters } from './types';
import { Asset } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';

export class AssetService {
  constructor(private assetRepository: AssetRepository) {}

  async onboardAsset(input: CreateAssetInput): Promise<Partial<Asset>> {
    // 1. Business Rule: Prevent duplicate Asset Tags
    const existingTag = await this.assetRepository.findByAssetTag(input.assetTag);
    if (existingTag) {
      throw new ApiError(409, `Conflict: Asset Tag '${input.assetTag}' is already registered.`);
    }

    // 2. Business Rule: Prevent duplicate Serial Numbers
    const existingSerial = await this.assetRepository.findBySerialNumber(input.serialNumber);
    if (existingSerial) {
      throw new ApiError(409, `Conflict: Serial Number '${input.serialNumber}' is already registered.`);
    }

    // 3. Create the asset
    const asset = await this.assetRepository.create(input);

    // 4. Automation: Generate persistent trackable QR dynamic signature
    // We use a public QR generator API string to store a lightweight reference for the frontend
    const qrPayload = `ERP-ASSET:${asset.id}:${asset.assetTag}:${asset.serialNumber}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;
    
    await this.assetRepository.updateQrCode(asset.id!, qrCodeUrl);
    asset.qrCode = qrCodeUrl;
    
    // (Note: History tracking will be added here in Step 6 of the master plan)

    return asset;
  }

  async getPaginatedAssets(filters: AssetQueryFilters) {
    return this.assetRepository.findManyAndCount(filters);
  }

  async getAssetDetails(id: string): Promise<Partial<Asset>> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new ApiError(404, `Not Found: No asset exists with ID '${id}'.`);
    }
    return asset;
  }

  async updateAssetSpecs(id: string, input: UpdateAssetInput): Promise<Partial<Asset>> {
    // Verify it exists first
    await this.getAssetDetails(id); 
    return this.assetRepository.update(id, input);
  }

  async safeDecommissionAsset(id: string): Promise<void> {
    const asset = await this.getAssetDetails(id);
    
    // Business Rule: Cannot delete an asset that is actively being used by an employee
    if (asset.status === 'ALLOCATED') {
      throw new ApiError(400, 'Security Violation: Cannot delete an asset that is currently ALLOCATED to an employee.');
    }
    
    // Business Rule: Never hard delete. We implement Soft Delete to preserve audit trails.
    await this.assetRepository.softDelete(id);
  }
}