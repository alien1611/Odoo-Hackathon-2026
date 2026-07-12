import { TransferRequestRepository, TransferQueryFilters } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { ApiError } from '../../utils/ApiError';
import { TransferStatus } from '@prisma/client';

export class TransferRequestService {
  constructor(
    private transferRepository: TransferRequestRepository,
    private assetRepository: AssetRepository,
    private historyRepository: AssetHistoryRepository
  ) {}

  async createRequest(data: {
    assetId: string;
    requestedBy: string;
    toDepartment: string;
    reason: string;
  }) {
    // 1. Fetch asset details
    const asset = await this.assetRepository.findById(data.assetId);
    if (!asset) {
      throw new ApiError(404, `Not Found: Asset with ID '${data.assetId}' does not exist.`);
    }

    // 2. Business Rule: Cannot transfer Disposed, Lost, or Under Maintenance assets
    const forbiddenStatuses = ['DISPOSED', 'LOST', 'UNDER_MAINTENANCE'];
    if (forbiddenStatuses.includes(asset.status!)) {
      throw new ApiError(400, `Bad Request: Cannot request transfer for asset with status '${asset.status}'.`);
    }

    // 3. Business Rule: Cannot transfer to the same department
    if (asset.departmentId === data.toDepartment) {
      throw new ApiError(400, 'Bad Request: Asset is already assigned to this department.');
    }

    // 4. Create request
    const request = await this.transferRepository.create({
      assetId: data.assetId,
      requestedBy: data.requestedBy,
      fromDepartment: asset.departmentId!,
      toDepartment: data.toDepartment,
      reason: data.reason,
    });

    // 5. Log history entry
    await this.historyRepository.create({
      assetId: data.assetId,
      action: 'TRANSFER_REQUESTED',
      performedBy: data.requestedBy,
      description: `Transfer requested from department ${asset.departmentId} to ${data.toDepartment}. Reason: ${data.reason}`,
    });

    return request;
  }

  async processRequest(id: string, data: {
    status: TransferStatus;
    approvedBy: string;
  }) {
    // 1. Fetch transfer request
    const request = await this.transferRepository.findById(id);
    if (!request) {
      throw new ApiError(404, `Not Found: Transfer request with ID '${id}' does not exist.`);
    }

    // 2. Check if already processed
    if (request.status !== 'PENDING') {
      throw new ApiError(400, 'Bad Request: Transfer request has already been processed.');
    }

    // 3. Handle Approval vs Rejection
    if (data.status === 'APPROVED') {
      // Update asset's department
      await this.assetRepository.update(request.assetId, {
        departmentId: request.toDepartment,
      });

      // Log success in history
      await this.historyRepository.create({
        assetId: request.assetId,
        action: 'TRANSFERRED',
        performedBy: data.approvedBy,
        description: `Department transfer approved. Moved from department ${request.fromDepartment} to ${request.toDepartment}.`,
      });
    } else if (data.status === 'REJECTED') {
      // Log rejection in history
      await this.historyRepository.create({
        assetId: request.assetId,
        action: 'TRANSFER_REJECTED',
        performedBy: data.approvedBy,
        description: `Department transfer request was rejected.`,
      });
    }

    // Update transfer request record
    return this.transferRepository.update(id, data);
  }

  async getRequests(filters: TransferQueryFilters) {
    return this.transferRepository.findManyAndCount(filters);
  }
}
