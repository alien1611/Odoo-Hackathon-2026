import { AssetAllocationRepository, AllocationQueryFilters } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { ApiError } from '../../utils/ApiError';

export class AssetAllocationService {
  constructor(
    private allocationRepository: AssetAllocationRepository,
    private assetRepository: AssetRepository,
    private historyRepository: AssetHistoryRepository
  ) {}

  async allocateAsset(data: {
    assetId: string;
    employeeId: string;
    allocatedBy: string;
    expectedReturnDate: Date;
    remarks?: string;
  }) {
    // 1. Fetch asset details
    const asset = await this.assetRepository.findById(data.assetId);
    if (!asset) {
      throw new ApiError(404, `Not Found: Asset with ID '${data.assetId}' does not exist.`);
    }

    // 2. Business Rule: Asset must be AVAILABLE
    if (asset.status !== 'AVAILABLE') {
      throw new ApiError(409, `Conflict: Asset is currently '${asset.status}' and cannot be allocated.`);
    }

    // 3. Create allocation record
    const allocation = await this.allocationRepository.create(data);

    // 4. Update asset status to ALLOCATED
    await this.assetRepository.update(data.assetId, { status: 'ALLOCATED' });

    // 5. Log history event
    await this.historyRepository.create({
      assetId: data.assetId,
      action: 'ALLOCATED',
      performedBy: data.allocatedBy,
      description: `Asset allocated to employee ${data.employeeId}. Expected return: ${data.expectedReturnDate.toLocaleDateString()}.`,
    });

    return allocation;
  }

  async returnAsset(data: {
    assetId: string;
    returnedBy: string;
    condition: string;
    remarks?: string;
  }) {
    // 1. Fetch active allocation for asset
    const activeAllocation = await this.allocationRepository.findActiveAllocationByAssetId(data.assetId);
    if (!activeAllocation) {
      throw new ApiError(404, `Not Found: No active allocation found for asset ID '${data.assetId}'.`);
    }

    // 2. Update allocation record
    const updatedAllocation = await this.allocationRepository.update(activeAllocation.id, {
      actualReturnDate: new Date(),
      status: 'RETURNED',
      remarks: data.remarks || activeAllocation.remarks || undefined,
    });

    // 3. Update asset status back to AVAILABLE and update condition
    await this.assetRepository.update(data.assetId, {
      status: 'AVAILABLE',
      condition: data.condition,
    });

    // 4. Log history event
    await this.historyRepository.create({
      assetId: data.assetId,
      action: 'RETURNED',
      performedBy: data.returnedBy,
      description: `Asset returned in '${data.condition}' condition. Remarks: ${data.remarks || 'None'}.`,
    });

    return updatedAllocation;
  }

  async getAllocations(filters: AllocationQueryFilters) {
    return this.allocationRepository.findManyAndCount(filters);
  }
}
